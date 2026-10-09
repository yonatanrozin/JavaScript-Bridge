import { BrowserWindow, type BrowserWindowConstructorOptions, shell, app } from 'electron';
import path from 'path';
import os from "os";

const localIP = Object.values(os.networkInterfaces()).flat()
  .filter((iface) => iface && iface.family === 'IPv4')
  .map(iface => iface!.address)[0];

export const sketchDir = app.isPackaged
  ? path.join(process.resourcesPath, 'sketch')
  : path.join(__dirname, '../../sketch');

class MainWindow extends BrowserWindow {
  constructor(options: BrowserWindowConstructorOptions) {
    super(options);

    this.webContents.on('before-input-event', (_event, input) => {
      if (input.type === 'keyDown' && input.key === 'f' && (input.control || input.meta)) {
        this.setFullScreen(!this.isFullScreen());
      }
      else if (input.type === 'keyDown' && input.key === 'e' && (input.control || input.meta)) {
        shell.openPath(sketchDir);
      }
      else if (input.type === 'keyDown' && input.key === 'Escape') {
        this.setFullScreen(false);
      }
      else if (input.type === 'keyDown' && input.key === 'r' && (input.control || input.meta)) {
        this.webContents.reload();
      }
      else if (input.type === 'keyDown' && input.key === 'i' && (input.control || input.meta)) {
        this.webContents.executeJavaScript(`alert("IP Address: ${localIP}")`);
      }
    });
    this.loadFile(`${sketchDir}/index.html`);
  }
}

export function createMainWindow(width: number, height: number, fullscreen: boolean) {
  return new MainWindow({
    width, height, fullscreen,
    fullscreenable: true,
    webPreferences: {
      sandbox: false,
      webSecurity: true,
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js")
    }
  });
}