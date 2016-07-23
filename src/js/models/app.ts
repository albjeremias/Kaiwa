import Me from './me';

declare const client: any;
declare const me: Me;

interface Storage {}
interface StorageConstructor {
    new(): Storage;
    prototype: Storage;
}

const $: JQueryStatic = require('jquery');
const _: _.LoDashStatic = require('lodash');

const asyncjs: Async = require('async');
const StanzaIO = require('stanza.io');

const AppState = require('./state');
const MainView = require('../views/main');
const Router = require('../router');
const Storage: StorageConstructor = require('../storage');
const xmppEventHandlers = require('../helpers/xmppEventHandlers');
const pushNotifications = require('../helpers/pushNotifications');
const Notify = require('notify.js');
const Desktop = require('../helpers/desktop');
const AppCache = require('../helpers/cache');
const url = require('url');

const SoundEffectManager = require('sound-effect-manager');

export default class App {
    async launch(): Promise<App|Error> {
        let app: App = this as App;

        window['app'] = app;

        const config = localStorage['config'];

        if (!config) {
            console.log('missing config');
            window.location = 'login.html' as any;
            const error = new Error('no config');
            return Promise.reject<Error>(error);
        }

        app.config = this.parseConfig(config);
        app.config.useStreamManagement = false; // Temporary solution because this feature is bugged on node 4.0

        if (KAIWA_CONFIG.sasl) {
            app.config.sasl = KAIWA_CONFIG.sasl;
        }

        // _.extend(this, Backbone.Events)

        let profile = {};

        try {
            app = await (async() => new Promise<App>((resolve, reject) => {
                app.notifications = new Notify();
                app.soundManager = new SoundEffectManager();
                app.desktop = new Desktop();
                app.cache = new AppCache();
                app.storage = new Storage();
                app.storage.open(() => resolve(app));
                app.composing = {};
                app.timeInterval = 0;
                app.mucInfos = [];
            }))();

            app = await (async() => new Promise<App>((resolve, reject) => {
                app.storage.profiles.get(app.config.jid, function (err, res) {
                    if (res) {
                        profile = res;
                        profile['jid'] = {
                            full: app.config.jid,
                             bare: app.config.jid
                        };
                        app.config.rosterVer = res.rosterVer;
                    }
                    return resolve(app);
                });
            }))();

            app = await (async() => new Promise<App>((resolve, reject) => {
                app.state = new AppState();
                app.me = window['me'] = new Me(profile);

                window.onbeforeunload = function () {
                    if (app.api.sessionStarted) {
                        app.api.disconnect();
                    }
                };

                app.api = window['client'] = StanzaIO.createClient(app.config);
                client.use(pushNotifications);
                xmppEventHandlers(app.api, app);

                app.api.once('session:started', function () {
                    app.state.hasConnected = true;
                    return resolve(app);
                });
                app.api.connect();
            }))();

            app.soundManager.loadFile('sounds/ding.wav', 'ding');
            app.soundManager.loadFile('sounds/threetone-alert.wav', 'threetone-alert');

            app.whenConnected(function () {
                function getInterval() {
                    if (client.sessionStarted) {
                        client.getTime(app.id, function (err, res) {
                            if (err) return;
                            app.timeInterval = res.time.utc - Date.now();
                        });
                        setTimeout(getInterval, 600000);
                    }
                }
                getInterval();
            });

            app = await (async() => new Promise<App>((resolve, reject) => {
                app.whenConnected(function () {
                    me.publishAvatar();
                });

                function start() {
                    // start our router and show the appropriate page
                    const baseUrl = url.parse(KAIWA_CONFIG.baseUrl);
                    app.history.start({pushState: false, root: baseUrl.pathname});
                    if (app.history.fragment === '' && KAIWA_CONFIG.startup)
                        app.navigate(KAIWA_CONFIG.startup);

                    return resolve();
                }

                new Router();
                // app.history = Backbone.history
                // app.history.on("route", function(route, params) {
                //     app.state.pageChanged = params
                // })

                app.view = new MainView({
                    model: app.state,
                    el: document.body
                });
                app.view.render();

                if (me.contacts.length) {
                    start();
                } else {
                    me.contacts.once('loaded', start);
                }
            }))();

            return app;
        } catch (e) {
            this.error = e;
            return Promise.reject<Error>(e);
        }
    }

    private parseConfig(json) {
        const config = JSON.parse(json);
        const credentials = config.credentials;
        if (!credentials) return config;

        for (const property in credentials) {
            if (!credentials.hasOwnProperty(property)) continue;

            const value = credentials[property];
            if (value.type === 'Buffer') {
                credentials[property] = new Buffer(value);
            }
        }

        return config;
    }

    whenConnected(func) {
        if (this.api.sessionStarted) {
            func();
        } else {
            this.api.once('session:started', func);
        }
    }
    navigate(page) {
        const url = (page.charAt(0) === '/') ? page.slice(1) : page;
        this.state.markActive();
        this.history.navigate(url, true);
    }
    renderPage(view, animation) {
        const container = $('#pages');

        if (this.currentPage) {
            this.currentPage.hide(animation);
        }
        // we call render, but if animation is none, we want to tell the view
        // to start with the active class already before appending to DOM.
        container.append(view.render(animation === 'none').el);
        view.show(animation);
    }
    serverConfig() {
        return KAIWA_CONFIG;
    }
    // TODO: add typings
    private view: any;
    api: any;
    private id: any;
    timeInterval: any;
    currentPage: any;
    state: any;
    history: any;
    config: any;
    soundManager: any;
    me: Me;
    storage: any;
    notifications: any;
    desktop: any;
    cache: any;
    mucInfos: any;
    composing: any;

    error: Error = null;
}
