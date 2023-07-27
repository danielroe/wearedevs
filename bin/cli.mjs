#!/usr/bin/env node
// @ts-check

import { loadConfig } from 'c12'
import { runMain } from 'citty'
import { build, copyPublicAssets, createDevServer, createNitro, prepare } from 'nitropack'
import rollupVue from 'rollup-plugin-vue'
import { defineLazyEventHandler, fromNodeMiddleware } from 'h3'
import { createServer, build as buildVite } from 'vite'
import vue from '@vitejs/plugin-vue'

/** @type {import('nitropack').NitroConfig} */
const defaultConfig = {
  rollupConfig: {
    plugins: [rollupVue()],
  },
  bundledStorage: ['templates'],
  devStorage: {
    templates: {
      driver: 'fs',
      base: '.nitro/templates',
    },
  },
  publicAssets: [
    {
      dir: '.nitro/client/assets',
      baseURL: '/assets',
      maxAge: 60 * 60 * 24 * 365,
    },
  ],
  handlers: [
    {
      route: '/**',
      handler: './app/server',
    },
  ],
  devHandlers: [
    {
      route: '/__vite',
      handler: defineLazyEventHandler(async () => {
        const server = await createServer({
          base: '/__vite',
          appType: 'custom',
          plugins: [vue()],
          server: { middlewareMode: true },
        })
        return fromNodeMiddleware(server.middlewares)
      }),
    },
  ],
}

runMain({
  subCommands: {
    dev: {
      async run() {
        const { config } = await loadConfig({
          defaultConfig,
          overrides: {
            preset: 'nitro-dev',
            dev: true,
          },
        })
        const nitro = await createNitro(config)
        /** @type {string} */
        const template = await nitro.storage.getItem('root:index.html')
        await nitro.storage.setItem(
          'templates:index.html',
          template.replace(
            '<script type="module" src="./app/client"></script>',
            '<script type="module" src="/__vite/@vite/client"></script><script type="module" src="/__vite/app/client"></script>'
          )
        )
        await prepare(nitro)
        const server = createDevServer(nitro)
        await server.listen({})
        await build(nitro)
      },
    },
    build: {
      async run() {
        const { config } = await loadConfig({
          defaultConfig,
          overrides: {
            dev: false,
          },
        })
        const nitro = await createNitro(config)
        await prepare(nitro)
        await buildVite({
          build: {
            outDir: '.nitro/client',
          },
          plugins: [vue()],
        })
        /** @type {string} */
        const template = await nitro.storage.getItem('build:client:index.html')
        await nitro.storage.setItem('templates:index.html', template)
        await copyPublicAssets(nitro)
        await build(nitro)
        await nitro.close()
      },
    },
  },
})
