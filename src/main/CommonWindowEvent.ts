import {
  BrowserWindow,
  ipcMain,
  app,
  BrowserWindowConstructorOptions,
  WebContents,
} from 'electron';

const BASE_WINDOW_CONFIG: BrowserWindowConstructorOptions = {
  frame: false,
  show: true,
  parent: undefined,
  webPreferences: {
    nodeIntegration: true,
    webSecurity: false,
    allowRunningInsecureContent: true,
    contextIsolation: false,
    webviewTag: true,
    spellcheck: false,
    disableHtmlFullscreenWindowResize: true,
    // nativeWindowOpen: true, electron 18 后移出该属性, 默认就是true
  },
};

const mergeConfig = (
  config: BrowserWindowConstructorOptions,
  hasWebPreferencesKey: boolean = false,
) => {
  const rConfig: BrowserWindowConstructorOptions = {
    ...BASE_WINDOW_CONFIG,
    ...config,
  };
  if (hasWebPreferencesKey) {
    rConfig.webPreferences = {
      ...BASE_WINDOW_CONFIG.webPreferences,
      ...(config.webPreferences || {}),
    };
  }
  console.log(rConfig, "config")
  return rConfig;
};

export class CommonWindowEvent {
  private static getWin(event: any) {
    return BrowserWindow.fromWebContents(event.sender);
  }

  public static listen() {
    ipcMain.handle('minimizeWindow', (e) => {
      this.getWin(e)?.minimize();
    });

    ipcMain.handle('maxmizeWindow', (e) => {
      this.getWin(e)?.maximize();
    });

    ipcMain.handle('unmaximizeWindow', (e) => {
      this.getWin(e)?.unmaximize();
    });

    ipcMain.handle('hideWindow', (e) => {
      this.getWin(e)?.hide();
    });

    ipcMain.handle('showWindow', (e) => {
      this.getWin(e)?.show();
    });

    ipcMain.handle('closeWindow', (e) => {
      this.getWin(e)?.close();
    });
    ipcMain.handle('resizable', (e) => {
      return this.getWin(e)?.isResizable();
    });
    ipcMain.handle('getPath', (e, name: any) => {
      return app.getPath(name);
    });
  }
  //主进程公共事件处理逻辑
  public static regWinEvent(win: BrowserWindow) {
    // console.log(win)
    win.on('maximize', () => {
      win.webContents.send('windowMaximized');
    });
    win.on('unmaximize', () => {
      win.webContents.send('windowUnmaximized');
    });

    // 在这里实现 打开窗口时的参数设置
    win.webContents.setWindowOpenHandler((details) => {
      const features = JSON.parse(
        details.features || '{}',
      ) as BrowserWindowConstructorOptions;
      const config = mergeConfig(features, "webPreferences" in features);
      if (config.modal === true) {
        config.parent = win;
      }

      return { action: 'allow', overrideBrowserWindowOptions: config };
    });
  }
}
