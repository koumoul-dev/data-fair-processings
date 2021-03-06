<template lang="html">
  <v-container data-iframe-height>
    <v-list>
      <v-subheader>Plugins Installés</v-subheader>
      <v-progress-linear v-if="!installedPlugins.results" indeterminate />
      <template v-for="result in installedPlugins.results">
        <v-list-item :key="'installed-' + result.id">
          <v-list-item-content>
            <v-list-item-title>{{ result.name }} ({{ result.version }})</v-list-item-title>
            <v-list-item-subtitle>{{ result.description }}</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn
              title="Désinstaller"
              icon
              color="warning"
              :disabled="loading"
              @click="uninstall(result)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
        <v-card v-if="result.pluginConfigSchema" :key="'config-' + result.id">
          <v-card-text>
            <v-form :ref="'form-' + result.id">
              <v-jsf
                v-model="result.config"
                :schema="result.pluginConfigSchema"
                @change="saveConfig(result)"
              />
            </v-form>
          </v-card-text>
        </v-card>
      </template>
      <v-subheader>Plugins disponibles</v-subheader>
      <v-progress-linear v-if="!availablePlugins.results" indeterminate />
      <v-list-item v-for="result in availablePlugins.results" :key="'available-' + result.name">
        <v-list-item-content>
          <v-list-item-title>{{ result.name }} ({{ result.version }})</v-list-item-title>
          <v-list-item-subtitle>{{ result.description }}</v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
          <v-btn
            title="Installer"
            icon
            color="primary"
            :disabled="loading || !installedPlugins.results || !!installedPlugins.results.find(r => r.name === result.name && r.version === result.version)"
            @click="install(result)"
          >
            <v-icon>mdi-download</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </v-container>
</template>

<script>
  import VJsf from '@koumoul/vjsf/lib/VJsf.js'
  import '@koumoul/vjsf/lib/deps/third-party.js'
  import '@koumoul/vjsf/dist/main.css'

  export default {
    components: { VJsf },
    middleware: 'superadmin-required',
    data: () => ({
      loading: false,
      availablePlugins: {},
      installedPlugins: {},
    }),
    created() {
      this.$store.dispatch('setBreadcrumbs', [{ text: 'plugins' }])
      this.fetchAvailablePlugins()
      this.fetchInstalledPlugins()
    },
    methods: {
      async fetchAvailablePlugins() {
        this.availablePlugins = await this.$axios.$get('/api/v1/plugins-registry')
      },
      async fetchInstalledPlugins() {
        this.installedPlugins = await this.$axios.$get('/api/v1/plugins')
      },
      async install(plugin) {
        this.loading = true
        await this.$axios.$post('/api/v1/plugins', plugin)
        await this.fetchInstalledPlugins()
        this.loading = false
      },
      async uninstall(plugin) {
        this.loading = true
        await this.$axios.$delete('/api/v1/plugins/' + plugin.id)
        await this.fetchInstalledPlugins()
        this.loading = false
      },
      async saveConfig(plugin) {
        this.loading = true
        await this.$axios.$put(`/api/v1/plugins/${plugin.id}/config`, plugin.config)
        this.loading = false
      },
    },
  }
</script>

<style lang="css" scoped>
</style>
