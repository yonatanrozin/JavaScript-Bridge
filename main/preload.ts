import { contextBridge } from 'electron';
import { BridgeSerialPort } from './Serial';
import { BridgeOSC } from './OSC';

import os from 'os';

const localIP = Object.values(os.networkInterfaces()).flat()
  .filter((iface) => iface && iface.family === 'IPv4')
  .map(iface => iface!.address)[0];

contextBridge.exposeInMainWorld('Bridge', {
    localIP,
    Serial: {
        list: async () => BridgeSerialPort.listPorts(),
        get: (path: string) => {
            return BridgeSerialPort.get(path).public;
        }
    },
    OSC: {
        begin: (port: number) => {
            return new BridgeOSC(port).public;
        },
        send: (args: Record<string, any[]>, host: string, port: number) => {
            BridgeOSC.send(host, port, args);
        }
    }
});
