import { contextBridge } from 'electron';
import { SerialPort } from 'serialport';
import { P5SerialPort } from './Serial';
import { OSC } from './OSC';

contextBridge.exposeInMainWorld('P5Local', {
    serial: {
        list: async () => SerialPort.list(),
        get: (path: string) => {
            return P5SerialPort.get(path).public;
        }
    },
    osc: {
        begin: (port: number) => {
            return new OSC(port).public;
        }
    }
});
