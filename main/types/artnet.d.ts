declare module "artnet" {
  namespace artnet {
    interface Options {
      host?: string;     // default "255.255.255.255"
      port?: number;     // default 6454
      refresh?: number;  // ms between full refreshes, default 4000
      iface?: string;    // network interface address to bind to
      sendAll?: boolean; // send all 512 channels instead of only up to the highest set
    }

    type DmxData = number | (number | null)[];
    type Callback = (err: Error | null, res?: unknown) => void;

    interface Artnet {
      // set(data) / set(channel, data) / set(universe, channel, data), each with an optional callback
      set(data: DmxData, callback?: Callback): void;
      set(channel: number, data: DmxData, callback?: Callback): void;
      set(universe: number, channel: number, data: DmxData, callback?: Callback): void;

      setHost(host: string): void;
      setPort(port: number): void;
      close(): void;
    }
  }

  function artnet(options?: artnet.Options): artnet.Artnet;

  export = artnet;
}