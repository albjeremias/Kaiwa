declare namespace XMPP {
    interface IClientOptions {}
    interface IPlugin {}
    class Client {
        config: IClientOptions;

        new(options: IClientOptions);

        connect(): void;

        on(events: string, group: any, handler: () => void): void;
        on(events: string, handler: () => void): void;
        once(events: string, handler: () => void): void;

        use(plugin: IPlugin): void;
    }

    function createClient(options: IClientOptions): Client;
}

declare module 'stanza.io' {
    export = XMPP;
}
