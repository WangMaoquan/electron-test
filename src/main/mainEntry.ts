import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  globalShortcut,
} from 'electron';
import { CommonWindowEvent } from './CommonWindowEvent';
import { CustomScheme } from './CustomScheme';

// 设置渲染进程开发者调试工具的警告, true 就不会显示警告了
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

let mainWindow: BrowserWindow;

const registryShortcut = () => {
  globalShortcut.register('CommandOrControl+J+K', () => {
    // 获取当前窗口
    BrowserWindow?.getFocusedWindow()?.webContents.openDevTools();
  });
};

app.on('browser-window-created', (e, win) => {
  // console.log(win, 'win');
  CommonWindowEvent.regWinEvent(win);
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.whenReady().then(() => {
  const config: BrowserWindowConstructorOptions = {
    webPreferences: {
      nodeIntegration: true, // 将node环境集成进渲染进程中
      webSecurity: true,
      allowRunningInsecureContent: true,
      contextIsolation: false, // 同一个上下文中允许使用Electron 的实例
      webviewTag: true,
      spellcheck: true,
      disableHtmlFullscreenWindowResize: true,
    },
  };
  mainWindow = new BrowserWindow(config);
  registryShortcut();
  // mainWindow.webContents.openDevTools({
  //   mode: 'undocked',
  // });
  if (process.argv[2]) {
    mainWindow.loadURL(process.argv[2]);
  } else {
    CustomScheme.registerScheme();
    mainWindow.loadURL(`app://index.html`);
  }
  CommonWindowEvent.listen();
});
