const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  css: {
    loaderOptions: {
      sass: {
        additionalData: `@import "@/styles/global.scss";`,
      },
    },
  },
  transpileDependencies: true
})
