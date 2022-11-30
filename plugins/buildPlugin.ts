import { Plugin, preprocessCSS } from 'vite';
import fs from 'fs-extra';
import path from 'path';

class MyBuild {

  // 编译主进程代码
  buildMain() {
    require('esbuild').buildSync({
      entryPoints: ["./src/main/mainEntry.ts"],
      bundle: true,
      platform: 'node',
      minify: true,
      outfile: "./dist/mainEntry.js",
      external: ["electron"]
    })
  }

  // 为生产环境准本package.json
  preparePackageJson() {
    const pkgJsonPath = path.join(process.cwd(), 'package.json');
    const localPkgJson = JSON.parse(fs.readFileSync(pkgJsonPath,  'utf-8'));
    const electronConfig = localPkgJson.devDependencies.electron.replace("^", "");
    localPkgJson.main = 'mainEntry.js';
    delete localPkgJson.scripts;
    delete localPkgJson.devDependencies;
    localPkgJson.devDependencies = {
      electron: electronConfig
    };
    localPkgJson.dependencies["better-sqlite3"] = "*";
    localPkgJson.dependencies["binging"] = "*";
    localPkgJson.dependencies["knex"] = "*";
    const targetJsonPath = path.join(process.cwd(), 'dist', 'package.json');
    fs.writeFileSync(targetJsonPath, JSON.stringify(localPkgJson));
    fs.mkdirSync(path.join(process.cwd(), 'dist/node_modules'))
  }

  // 使用electron-builder 制作安装包
  buildInstaller() {
    const options = {
      config: {
        directories: {
          output: path.join(process.cwd(), 'release'),
          app: path.join(process.cwd(), 'dist')
        },
        files: ["**"],
        extends: null,
        productName: 'electron-test',
        appId: 'electron-test-app',
        asar: true,
        nsis: {
          oneClick: true,
          perMachine: true,
          allowToChangeInstallationDirectory: false,
          createDesktopShortcut: true,
          createStartMenuShortcut: true,
          shortcutName: "electron-test",
        },
        publish: [{ provider: "generic", url: "http://localhost:5500/" }],
      },
      project: process.cwd()
    }

    return require('electron-builder').build(options)
  }

  async prepareSqlite() {
    const srcDir = path.join(process.cwd(), `node_modules/better-sqlite3`);
    const destDir = path.join(process.cwd(), `dist/node_modules/better-sqlite3`);
    fs.ensureDirSync(destDir);
    fs.copySync(srcDir, destDir, {
      filter: (src, dest) => {
        if (src.endsWith('better-sqlite3') || src.endsWith('build') || src.endsWith('Release') || src.endsWith('better-sqlite3.node')) {
          return true;
        } else if (src.includes('node_modules\\better-sqlite3\\lib')) {
          return true
        } else {
          return false
        }
      }
    })
    const betterSqlPkgObj = {
      name: 'better-sqlite3',
      main: "lib/index.js"
    }
    const betterSqlPkgJson = JSON.stringify(betterSqlPkgObj);
    const betterSqlPkgJsonPath = path.join(process.cwd(), "dist/node_modules/better-sqlite3/package.json");
    fs.writeFileSync(betterSqlPkgJsonPath, betterSqlPkgJson);

    const bingingPath = path.join(process.cwd(), `dist/node_modules/bingings/index.js`)
    fs.ensureFileSync(bingingPath);
    const bingingContent = `
      module.exports = () => {
        const addonPath = require("path").join(__dirname, "../better-sqlite3/build/Release/better_sqlite3.node");
        return require(addonPath);
      };
    `;
    fs.writeFileSync(bingingPath, bingingContent);
    const bingingPkgObj = {
      name:'binging',
      main: 'index.js'
    }
    const bingingPkgJson = JSON.stringify(bingingPkgObj);
    const bingingPkgJsonPath = path.join(process.cwd(), 'dist/node_modules/bingings/package.json');
    fs.writeFileSync(bingingPkgJsonPath, bingingPkgJson);
  }

  prepareKnexjs() {
    const pkgJsonPath = path.join(process.cwd(), `dist/node_modules/knex`);
    fs.ensureFileSync(pkgJsonPath);
    require('esbuild').buildSync({
      entryPoints: ["./node_modules/knex/knex.js"],
      bundle: true,
      platform: 'node',
      format: 'cjs',
      minify: true,
      outfile: './dist/node_modules/knex/index.js',
      external: ['oracledb', 'pg-query-steam', 'pg', 'sqlite3', 'tedious', 'mysql', 'mysql2', 'better-sqlite3']
    })
    const pkgJsonObj = {
      name: 'knex',
      main: 'index.js'
    }
    const pkgJson = JSON.stringify(pkgJsonObj);
    fs.writeFileSync(path.join(process.cwd(), 'dist/node_modules/knex/packages.json'), pkgJson)
  }
}

export const buildPlugin = () => {
  return {
    name: 'build-plugin',
    async closeBundle() {
      const build = new MyBuild();
      build.buildMain();
      build.preparePackageJson();
      await build.prepareSqlite();
      build.prepareSqlite();
      build.buildInstaller();
    }
  } as Plugin
}