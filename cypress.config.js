// cypress.config.js
const { defineConfig } = require('cypress')

module.exports = defineConfig({
    e2e: {
        baseUrl: 'http://localhost:5173',  // Frontend dev server
        env: {
            apiUrl: 'http://localhost:5050/api/v1',  // Backend API
        },
        viewportWidth: 1280,
        viewportHeight: 800,
        video: false,
        retries: 1,
        setupNodeEvents(on, config) {
            // You can add custom tasks or reporters here later
        },
    },
})
