import artnet, { Artnet, DmxData } from 'artnet';

export class BridgeArtNet {

    static senders = new Map<string, Artnet>();

    static send(universe: number, start: number, data: DmxData, host?: string, port?: number) {
        const key = JSON.stringify([host, port]);
        const sender: Artnet = this.senders.get(key) ?? artnet({host, port, refresh: undefined})
        this.senders.set(key, sender);
        sender.set(universe, start, data);
    }
}