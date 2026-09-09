import { app } from 'electron';
import { createMainWindow } from './MainWindow';

app.whenReady().then(() => {
  createMainWindow(800, 600, false);
});
