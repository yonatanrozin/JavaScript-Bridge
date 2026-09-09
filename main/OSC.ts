import OSCJS from "osc-js";

export class OSC extends OSCJS {

    static servers = new Map<number, OSC>();

    port: number;

    constructor(port: number, host: string = "0.0.0.0") {
        super({ plugin: new OSCJS.DatagramPlugin({ open: { port, host } } as any) });
        OSC.servers.get(port)?.close();
        this.port = port;
        this.open();
        OSC.servers.set(port, this);
    }

    route(path: string, callback: (args: any[], address: string) => void) {
        this.on(path, (message: { address: string; args: any[] }) => callback(message.args, message.address));
    }

    get public() {
        return {
            port: this.port,
            route: (path: string, callback: (args: any[], address: string) => void) => this.route(path, callback),
        };
    }
}
