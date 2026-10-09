import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline'

export class BridgeSerialPort extends SerialPort {

    private static ports = new Map<string, BridgeSerialPort>();

    static get(path: string): BridgeSerialPort {
        const existing = BridgeSerialPort.ports.get(path);
        if (existing) return existing;

        const instance = new BridgeSerialPort(path);
        BridgeSerialPort.ports.set(path, instance);
        return instance;
    }

    static async listPorts() {
        const ports = await SerialPort.list() as any;
        return Object.fromEntries(ports.map(({path, friendlyName}: {path: string, friendlyName: string}) => [path, friendlyName]));
    }

    static async closeAll() {
        for (const port of BridgeSerialPort.ports.values()) {
            if (port.isOpen) await port.closeAsync();
        }
        BridgeSerialPort.ports.clear();
    }

    private parser: ReadlineParser;

    private constructor(path: string) {
        super({ path, baudRate: 9600, autoOpen: false });
        this.parser = this.pipe(new ReadlineParser({ delimiter: '\n' }));
    }

    begin(baudRate: number = 9600) {
        if (this.isOpen) return this.update({ baudRate });
        this.settings.baudRate = baudRate;
        this.open(err => {
            if (err) console.error(err);
            else console.log(`Serial port ${this.path} opened successfully.`);
        });
        return this.public;
    }

    onData(callback: (data: string, bytes: number[]) => void) {
        this.parser.removeAllListeners("data");
        this.parser.on("data", (data: string) => {
            const bytes = [...Buffer.from(data, "utf8")];
            callback(data.trim(), bytes);
        });
    }

    send(data: string | number) {
        if (!this.isOpen) throw new Error(`Serial port ${this.path} is not open.`);
        this.write(typeof data === 'number' ? Buffer.from([data]) : data);
        this.flush();
    }

    private closeAsync() {
        console.log(`Closing serial port ${this.path}...`);
        return new Promise<void>((resolve, reject) => {
            if (!this.isOpen) return resolve();
            this.close(err => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    get public() {
        return {
            path: this.path,
            begin: (baudRate?: number) => this.begin(baudRate),
            close: () => this.close(),
            send: (data: string | number) => this.send(data),
            onData: this.onData.bind(this),
            isOpen: () => this.isOpen
        };
    }
}