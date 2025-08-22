import { defineConfig } from 'vite'

// Set base to repository name so GitHub Pages serves assets from
// https://<user>.github.io/<repo>/assets/... instead of /assets/...
export default defineConfig({
  base: '/VisualCode/'
})
