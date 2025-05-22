import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'form-extension',
    description: 'help fill in timesheet',
    host_permissions: ['https://*/*', 'http://*'],
    permissions: ['tabs', 'scripting'],
    content_scripts: [{ matches: ['https://*/*'], js: ['content-scripts/content.js'] }]
  }
});
