<template lang="html">
  <div>
    <v-row
      v-if="processing"
      column
      style="position:fixed;right:2px;z-index:10"
    >
      <!-- <view-resource :resource="issue" :fab="true" type="issues" />
      <clone-resource :resource="issue" :fab="true" type="issues" @created="$router.push({name: 'issues-id-edit', params:{id: $event.id}})"/>
      <remove-resource :resource="issue" :fab="true" type="issues" @removed="$router.push({name: 'issues'})"/> -->
    </v-row>
    <v-container
      v-if="processing"
      grid-list-xl
      fluid
    >
      <nuxt-link :to="{name: 'embed-processings'}">
        Retour à la liste des traitements
      </nuxt-link>
      <v-row>
        <v-col
          cols="12"
          sm="6"
          md="7"
          lg="8"
        >
          <section-title :text="processing.title" />
          <div v-if="processing.dataset">
            Jeu de données associé : <a :href="datasetUrl(processing.dataset.id)" target="_blank">{{ processing.dataset.title }}</a>
          </div>
          <section-subtitle text="Source des données" />
          <v-form ref="form">
            <v-jsf
              v-if="processingSchema"
              v-model="processing.source.config"
              :options="{disableAll: true}"
              :schema="schema"
            />
          </v-form>
        </v-col>
        <v-col
          cols="12"
          sm="6"
          md="5"
          lg="4"
        >
          <v-card>
            <v-card-text class="py-0">
              <v-list>
                <v-list-item dense>
                  <v-list-item-content>
                    <div>
                      <span class="grey--text text--darken-2">Type de traitement :</span> <processing-infos :processing="processing" />
                    </div>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item dense>
                  <v-list-item-content>
                    <div>
                      <span class="grey--text text--darken-2">Périodicité :</span> <span>{{ format(processing.scheduling) }}</span>
                    </div>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item dense>
                  <v-list-item-content>
                    <div>
                      <span class="grey--text text--darken-2">Exécuté :</span>
                      <span v-if="processing['last-execution']">
                        <span>{{ processing['last-execution'].date | moment('from') }}</span>
                        &nbsp;<v-chip :color="processing['last-execution'].status === 'ok' ? 'success' : 'error'" small>
                          {{ processing['last-execution'].status }}
                        </v-chip>
                      </span><span v-else>jamais</span>
                    </div>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item dense>
                  <v-list-item-content>
                    <span>
                      <span class="grey--text text--darken-2">Actif :</span> <v-icon :color="processing.active ? 'success' : 'error'">
                        mdi-circle
                      </v-icon>
                    </span>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item dense>
                  <v-list-item-content>
                    <span>
                      <span class="grey--text text--darken-2">Clé webhook :</span> <code>{{ processing.webhookKey }}</code> <processing-key :processing="processing" />
                    </span>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card-text>
            <v-divider />
            <v-card-text class="px-5 py-0">
              <v-row align="center">
                <v-col v-if="processing.scheduling && processing.scheduling.unit !== 'trigger'">
                  <processing-schedule :processing-id="processing.id" />
                </v-col>
                <v-col>
                  <v-icon size="18">
                    mdi-plus-circle-outline
                  </v-icon>&nbsp;{{ processing.created.date | moment('from') }}
                </v-col>
                <v-col>
                  <v-icon size="18">
                    mdi-update
                  </v-icon>&nbsp;{{ processing.updated.date | moment('from') }}
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <section-subtitle text="Journal du traitement" />
      <v-card class="py-3">
        <v-simple-table height="400">
          <template #default>
            <thead>
              <tr>
                <th>
                  Date
                </th>
                <th>
                  Message
                </th>
                <th c>
                  Statut
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in logs" :key="log.date">
                <td>{{ log.date | moment('Do MMM YYYY - HH:mm:ss') }}</td>
                <td>{{ log.message }}</td>
                <td>
                  <v-chip :color="log.status === 'ok' ? 'success' : 'error'" small>
                    {{ log.status }}
                  </v-chip>
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card>
    </v-container>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import ProcessingInfos from '~/components/processing-infos.vue'
  import ProcessingSchedule from '~/components/processing-schedule.vue'
  import ProcessingKey from '~/components/processing-key.vue'
  import VJsf from '@koumoul/vjsf/lib/VJsf.js'
  import format from '~/assets/format.js'

  export default {
    components: { ProcessingInfos, ProcessingSchedule, ProcessingKey, VJsf },
    middleware: 'admin-required',
    data: () => ({
      processing: null,
      processingSchema: null,
      logs: [],
    }),
    computed: {
      ...mapState('session', ['user']),
      schema() {
        const source = this.processingSchema.properties.source.oneOf.find(s => s.properties.type.const === this.processing.source.type)
        return source && source.properties.config
      },
    },
    async mounted() {
      this.processingSchema = await this.$axios.$get(process.env.publicUrl + '/api/v1/processings/_schema')
      this.processing = await this.$axios.$get(process.env.publicUrl + '/api/v1/processings/' + this.$route.params.id)
      this.logs = await this.$axios.$get(process.env.publicUrl + '/api/v1/processings/' + this.$route.params.id + '/logs')
    },
    methods: {
      datasetUrl(datasetId) {
        return process.env.datasetsUrlTemplate.replace('{id}', datasetId)
      },
      format,
    },
  }
</script>