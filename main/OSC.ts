import { Server, Client, Message, Bundle } from "node-osc";

type OSCMessageData = [string, ...any[]];

export class BridgeOSC extends Server {

    /** OSC receiver objects by bound port # */
    static servers = new Map<number, BridgeOSC>();

    static clients = new Map<string, Client>();

    static send(host: string, port: number, messages: Record<string, (number | string)[]>) {
        if (typeof host !== "string") throw new Error("Host must be a string");
        if (typeof port !== "number") throw new Error("Port must be a number");
        const entries = Object.entries(messages).map(([key, value]) => [key, ...value]) as [string, ...(number | string)[]][];
        if (entries.length === 0) throw new Error("No OSC messages to send");
        const key = JSON.stringify([host, port]);
        let client = BridgeOSC.clients.get(key);
        if (!client) {
            client = new Client(host, port);
            BridgeOSC.clients.set(key, client);
        }
        let data: Message | Bundle;
        if (entries.length == 1) data = new Message(...entries[0]!);
        else data = new Bundle(0, ...entries);
        client.send(data);
    }

    routes = new Map<RegExp, (args: any[], address: string) => void>();

    port: number;

    constructor(port: number = 3000) {
        super(port, "0.0.0.0", () => {
            console.log(`OSC receiver listening on port ${port}`);
            this.on("message", this.onMessage);
            this.on("bundle", this.onBundle);
        });
        this.port = port;
        BridgeOSC.servers.set(port, this);
    }

    private onBundle({elements}: {elements: OSCMessageData[]}) {
        for (const message of elements) {
            this.onMessage(message);
        }
    }

    private onMessage([address, ...args]: OSCMessageData) {
        for (const [regex, callback] of this.routes.entries()) {
            if (regex.test(address)) {
                callback(args, address);
                break;
            }
        }
    }

    route(path: string | RegExp, callback: (args: any[], address: string) => void) {
        this.routes.set(typeof path === "string" ? new RegExp(`^${path.replace(/\*/g, ".*")}$`) : path, callback);
    }

    get public() {
        return {
            port: this.port,
            route: (path: string, callback: (args: any[], address: string) => void) => this.route(path, callback),
        };
    }
}
