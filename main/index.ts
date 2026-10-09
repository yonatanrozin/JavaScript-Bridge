import { app } from 'electron';
import { createMainWindow } from './MainWindow';
import { BridgeSerialPort } from './Serial';

import "./ArtNet";

app.whenReady().then(() => {
  createMainWindow(800, 600, false);
});

app.on('window-all-closed', () => {
  BridgeSerialPort.closeAll();
  app.quit();
});