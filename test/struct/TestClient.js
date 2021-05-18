const { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } = require('../../src/index');

class TestClient extends AkairoClient {
    constructor() {
        super({
            ownerID: '370637638820036608'
        });

        this.commandHandler = new CommandHandler(this, {
            directory: './commands/',
            ignoreCooldownID: ['132266422679240704'],
            aliasReplacement: /-/g,
            prefix: '?',
            allowMention: true,
            commandUtil: true,
            commandUtilLifetime: 10000,
            commandUtilSweepInterval: 10000,
            storeMessages: true,
            handleEdits: true,
            argumentDefaults: {
                prompt: {
                    start: 'What is thing?',
                    modifyStart: (msg, text) => `${msg.author}, ${text}\nType \`cancel\` to cancel this command.`,
                    retry: 'What is thing, again?',
                    modifyRetry: (msg, text) => `${msg.author}, ${text}\nType \`cancel\` to cancel this command.`,
                    timeout: 'Out of time.',
                    ended: 'No more tries.',
                    cancel: 'Cancelled.',
                    retries: 5
                },
                modifyOtherwise: (msg, text) => `${msg.author}, ${text}`
            }
        });

        this.inhibitorHandler = new InhibitorHandler(this, {
            directory: './inhibitors/'
        });

        this.listenerHandler = new ListenerHandler(this, {
            directory: './listeners/'
        });

        this.setup();
    }

    setup() {
        this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
        this.commandHandler.useListenerHandler(this.listenerHandler);

        this.listenerHandler.setEmitters({
            commandHandler: this.commandHandler,
            inhibitorHandler: this.inhibitorHandler,
            listenerHandler: this.listenerHandler
        });

        this.commandHandler.loadAll();
        this.inhibitorHandler.loadAll();
        this.listenerHandler.loadAll();

        const resolver = this.commandHandler.resolver;
        resolver.addType('1-10', (message, phrase) => {
            const num = resolver.type('integer')(phrase);
            if (num == null) return null;
            if (num < 1 || num > 10) return null;
            return num;
        });
    }

    async start(token) {
        // await this.settings.init();
        await this.login(token);
        console.log(`Test Client has connected to DogeCord and Discord gateway!`); // eslint-disable-line no-console
    }
}

module.exports = TestClient;
