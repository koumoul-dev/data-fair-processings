<template>
  <v-card
    outlined
    tile
    :elevation="hover ? 4 : 0"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <nuxt-link :to="`/processings/${processing._id}`" style="text-decoration:none">
      <v-card-title>
        <span class="font-weight-bold" style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">
          {{ processing.title || processing._id }}
        </span>
      </v-card-title>
      <v-divider />
      <v-card-text style="min-height: 96px;" class="pa-0">
        <v-list dense>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon>mdi-power-plug</v-icon>
            </v-list-item-avatar>
            <span>{{ processing.plugin }}</span>
          </v-list-item>
          <template v-if="processing.lastRun">
            <v-list-item v-if="processing.lastRun.status === 'running'">
              <v-list-item-avatar>
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="24"
                />
              </v-list-item-avatar>
              <span>Exécution en cours depuis {{ processing.lastRun.startedAt | moment('from') }}</span>
            </v-list-item>

            <v-list-item v-if="processing.lastRun.status === 'finished'">
              <v-list-item-avatar>
                <v-icon color="success">
                  mdi-check-circle
                </v-icon>
              </v-list-item-avatar>
              <span>Dernière exécution terminée {{ processing.lastRun.finishedAt | moment('from') }}</span>
            </v-list-item>

            <v-list-item v-if="processing.lastRun.status === 'error'">
              <v-list-item-avatar>
                <v-icon color="error">
                  mdi-alert
                </v-icon>
              </v-list-item-avatar>
              <span>Dernière exécution en échec {{ processing.lastRun.finishedAt | moment('from') }}</span>
            </v-list-item>
          </template>
          <v-list-item v-else>
            <v-list-item-avatar />
            <span>Aucune exécution dans l'historique</span>
          </v-list-item>

          <template v-if="processing.nextRun">
            <v-list-item v-if="processing.nextRun.status === 'scheduled'">
              <v-list-item-avatar>
                <v-icon>mdi-clock</v-icon>
              </v-list-item-avatar>
              <span>Prochaine exécution planifiée {{ processing.nextRun.scheduledAt | moment('from') }}</span>
            </v-list-item>

            <v-list-item v-if="processing.nextRun.status === 'triggered'">
              <v-list-item-avatar>
                <v-icon>mdi-play-circle</v-icon>
              </v-list-item-avatar>
              <span>Prochaine exécution déclenchée manuellement le {{ processing.nextRun.createdAt | moment('from') }}</span>
            </v-list-item>
          </template>
        </v-list>
      </v-card-text>
    </nuxt-link>
    <v-card-actions class="pl-3">
      <owner-short v-if="showOwner" :owner="processing.owner" />
      <v-spacer />
    </v-card-actions>
  </v-card>
</template>

<script>
  const marked = require('marked/lib/marked')

  export default {
    props: ['processing', 'showOwner'],
    data: () => ({
      marked,
      hover: false,
    }),
  }
</script>

<style lang="css" scoped>
</style>
