import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

export class P5SerialPort {

    static instances = new Map<string, P5SerialPort>();

    static get(path: string): P5SerialPort {
        const existing = P5SerialPort.instances.get(path);
        if (existing) return existing;

        const instance = new P5SerialPort(path);
        P5SerialPort.instances.set(path, instance);
        return instance;
    }

    path: string;
    private port: SerialPort;
    private parser: ReadlineParser;

    private constructor(path: string) {
        this.port = new SerialPort({ path, baudRate: 9600, autoOpen: false });
        this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\n' }));
        this.path = path;
    }

    open(baudRate?: number) {
        if (this.port.isOpen && baudRate) {
            this.port.update({ baudRate });
            return;
        }
        if (baudRate) this.port.settings.baudRate = baudRate;
        this.port.open(err => {
            if (err) console.error(err);
        });
    }

    close() {
        if (this.port.isOpen) this.port.close();
    }

    onData(callback: (data: string) => void) {
        this.parser.removeAllListeners("data");
        this.parser.on("data", (data: Buffer) => callback(data.toString()));
    }

    send(data: string | number) {
        if (!this.port.isOpen) return;
        this.port.write(typeof data === 'number' ? Buffer.from([data]) : data);
        this.port.flush();
    }

    get public() {
        return {
            path: this.path,
            open: (baudRate?: number) => this.open(baudRate),
            close: () => this.close(),
            send: (data: string | number) => this.send(data),
            onData: this.onData.bind(this),
            isOpen: () => this.port.isOpen
        };
    }
}