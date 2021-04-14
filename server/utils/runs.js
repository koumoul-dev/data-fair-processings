const CronJob = require('cron').CronJob
const { nanoid } = require('nanoid')
const ajv = require('ajv')()
const runSchema = require('../../contract/run')
const validate = ajv.compile(runSchema)
const schedulingUtils = require('./scheduling')

exports.applyProcessing = async (db, processing) => {
  // if processing is deactivated, cancel pending runs
  if (!processing.active) {
    await db.collection('runs')
      .deleteMany({ 'processing._id': processing._id, status: { $in: ['scheduled', 'triggered'] } })
    return
  }

  // if processing is set on manual trigger, cancel job that might have been scheduled previously
  if (processing.scheduling.type === 'trigger') {
    await db.collection('runs')
      .deleteMany({ 'processing._id': processing._id, status: 'scheduled' })
    return
  }

  await exports.createNext(db, processing)
}

exports.deleteProcessing = async (db, processing) => {
  await db.collection('runs').deleteMany({ 'processing._id': processing._id })
}

exports.createNext = async (db, processing, triggered) => {
  const run = {
    _id: nanoid(),
    owner: processing.owner,
    processing: {
      _id: processing._id,
      title: processing.title,
    },
    createdAt: new Date().toISOString(),
    status: triggered ? 'triggered' : 'scheduled',
    log: [],
  }

  // cancel one that might have been scheduled previously
  if (triggered) {
    await db.collection('runs')
      .deleteMany({ 'processing._id': processing._id, status: { $in: ['triggered', 'scheduled'] } })
  } else {
    await db.collection('runs')
      .deleteMany({ 'processing._id': processing._id, status: 'scheduled' })
    const cron = schedulingUtils.toCRON(processing.scheduling)
    const job = new CronJob(cron, () => {})
    run.scheduledAt = job.nextDates().toISOString()
  }

  const valid = validate(run)
  if (!valid) throw new Error(JSON.stringify(validate.errors))
  await db.collection('runs').insertOne(run)
  await db.collection('processings').updateOne(
    { _id: run.processing._id },
    { $set: { nextRun: { ...run, log: undefined, processing: undefined, owner: undefined } } },
  )
  return run
}

exports.running = async (db, run) => {
  const lastRun = (await db.collection('runs').findOneAndUpdate(
    { _id: run._id },
    { $set: { status: 'running', startedAt: new Date().toISOString() } },
    { returnOriginal: false, projection: { log: 0, processing: 0, owner: 0 } },
  )).value
  await db.collection('processings')
    .updateOne({ _id: run.processing._id }, { $set: { lastRun, nextRun: null } })
}

exports.finish = async (db, run, errorMessage) => {
  const query = {
    $set: {
      status: 'finished',
      finishedAt: new Date().toISOString(),
    },
  }
  if (errorMessage) {
    query.$set.status = 'error'
    query.$push = { log: { type: 'debug', msg: errorMessage } }
  }
  const lastRun = (await db.collection('runs').findOneAndUpdate(
    { _id: run._id },
    query,
    { returnOriginal: false, projection: { log: 0, processing: 0, owner: 0 } },
  )).value
  await db.collection('processings')
    .updateOne({ _id: run.processing._id }, { $set: { lastRun } })
}
