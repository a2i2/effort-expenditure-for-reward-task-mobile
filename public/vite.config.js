import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import fse from 'fs-extra';

export default defineConfig({
  root: './',
  publicDir: false,
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: ''
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  plugins: [
    {
      name: 'copy-non-module-scripts',
      enforce: 'post',
      async generateBundle(options, bundle) {
        // Copy non-module scripts to the output directory
        const scriptsToCopy = [
          'src/phaser.min.js',
          'src/ui/rexuiplugin.min.js',
          'src/embedContext/embedContext.js'
        ];

        // Copy the assets directory
        await fse.copy('src/assets', 'dist/src/assets');

        scriptsToCopy.forEach(scriptPath => {
          const fileContent = fs.readFileSync(scriptPath);
          this.emitFile({
            type: 'asset',
            fileName: scriptPath,
            source: fileContent
          });
        });
      }
    }
  ]
})