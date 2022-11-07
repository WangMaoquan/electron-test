import { Plugin } from 'vite';
import fs from 'fs';
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
}

export const buildPlugin = () => {
  return {
    name: 'build-plugin',
    closeBundle() {
      const build = new MyBuild();
      build.buildMain();
      build.preparePackageJson();
      build.buildInstaller();
    }
  } as Plugin
}