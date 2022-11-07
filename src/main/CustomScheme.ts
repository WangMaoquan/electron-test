import { protocol } from 'electron'
import fs from 'fs';
import path from 'path';

const schemeConfig = { standard: true, supportFetchAPI: true, bypassCSP: true, corsEnabled: true, stream: true };
protocol.registerSchemesAsPrivileged([{ scheme: "app", privileges: schemeConfig }]);

const mineTypeMap: Record<string, string> = {
  '.js': 'text/javascript',
  '.html': 'text/html',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.json': 'application/json'
}

export class CustomScheme {
  //根据文件扩展名获取mime-type
  private static getMimeType(extension: string) {
    return mineTypeMap[extension];
  }

    //注册自定义app协议
    static registerScheme() {
      protocol.registerStreamProtocol("app", (request, callback) => {
        let pathName = new URL(request.url).pathname;
        let extension = path.extname(pathName).toLowerCase();
        if (extension == "") {
          pathName = "index.html";
          extension = ".html";
        }
        let tarFile = path.join(__dirname, pathName);
        callback({
          statusCode: 200,
          headers: { "content-type": this.getMimeType(extension) },
          data: fs.createReadStream(tarFile),
        });
      });
    }
}