import { ViteDevServer, Plugin } from 'vite';
import { Entries } from 'vite-plugin-optimizer'

export const devPlugin = () => {
  return {
    name: 'dev-plugin',
    configureServer(server: ViteDevServer) {
      require('esbuild').buildSync({
        entryPoints: ["./src/main/mainEntry.ts"],
        bundle: true,
        platform: 'node',
        outfile: './dist/mainEntry.js',
        external: ['electron']
      });
      server.httpServer?.once('listening', () => {
        const { spawn } = require('child_process');
        const addressInfo = server.httpServer?.address();
        if (addressInfo && typeof addressInfo !== 'string') {
          const httpAddress = `http://${addressInfo.address}:${addressInfo.port}`;
          const electronProcess = spawn(require('electron').toString(), ['./dist/mainEntry.js', httpAddress], {
            cwd: process.cwd(),
            static: 'inherit'
          })
          electronProcess.on('close', () => {
            server.close();
            process.exit();
          })
        }
      })
    }
  } as Plugin
}

export const getReplacer = () => {
  const externalModules = ["os", "fs", "path", "events", "child_process", "crypto", "http", "buffer", "url", "better-sqlite3", "knex"];
  const result = {};
  externalModules.forEach(module => {
    result[module] = () => ({
      find: new RegExp(`^${module}$`),
      code: `const ${module} = require("${module}"); export { ${module} as default }`
    })
  })
  result["electron"] = () => {
    const electronModules = ["clipboard", "ipcRenderer", "nativeImage", "shell", "webFrame"].join(",");
    return {
      find: new RegExp(`^electron$`),
      code: `const { ${electronModules} } = require('electron'); export { ${electronModules} }`
    }
  }

  return result as Entries
}