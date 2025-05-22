import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'extension-boilerplate',
    description: 'description for manifest.json',
    host_permissions: ['https://*/*', 'http://*'],
    permissions: ['tabs', 'scripting'],
    content_scripts: [{ matches: ['https://*/*'], js: ['content-scripts/content.js'] }]
  }
});
