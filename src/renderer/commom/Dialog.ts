import { BrowserWindowConstructorOptions } from 'electron';

interface DialogReadyEvent {
  data: {
    msgName: string;
  }
  [key: string]: any;
}

/**
 * 1. 需要参数是 打开的地址 和 dialog 的相关配置
 * 2. 父级是需要知道 dialog是否打开成功
 */
const createDialog = (
  url: string,
  config: BrowserWindowConstructorOptions,
) => {
  return new Promise<Window>((resolve, reject) => {
    const windowProxy = window.open(url, '_blank', JSON.stringify(config));
    const dialogOnReady = (e: DialogReadyEvent) => {
      console.log(e)
      const data = e.data || {};
      if (data["msgName"] === `__dialogReady` && windowProxy) {
        window.removeEventListener("message", dialogOnReady);
        resolve(windowProxy);
      }
    }
    window.addEventListener("message", dialogOnReady);
  })
};


const dialogReady = () => {
  window.opener.postMessage({ msgName: `__dialogReady` });
}

export {
  createDialog,
  dialogReady
}