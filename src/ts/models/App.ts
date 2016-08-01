import {browserHistory} from 'react-router';
import update = require('react-addons-update');

import {connecting} from '../redux/Actions';
import {IApplicationState} from '../redux/Application';
import {ISession, LOCAL_STORAGE_KEY} from '../redux/Session';
import {ApplicationState} from '../redux/State';
import Storage from '../storage';
import Calls from './calls';
import Me from './Me';

import Store = Redux.Store;

declare const client: any;
declare const me: Me;

const $: JQueryStatic = require('jquery');

const StanzaIO = require('stanza.io');

const AppState = require('../../js/models/state');
const Notify = require('notify.js');
const Desktop = require('../../js/helpers/desktop');
const AppCache = require('../../js/helpers/cache');
const url = require('url');

const SoundEffectManager = require('sound-effect-manager');

interface IConfig extends ISession {
    useStreamManagement?: boolean;
    sasl?: string|string[];
    rosterVer?: string;
}

export default class App {
    calls = new Calls();
    config: IConfig;

    constructor(private store: Store<IApplicationState>) {
        store.subscribe(() => this.onStoreChange(store.getState()));
    }

    private onStoreChange(state: IApplicationState): void {
        console.log('App.onStoreChange', state);
        switch (state.state) {
            case ApplicationState.Login:
                console.log('Starting login sequence');
                browserHistory.push('/connecting');
                let {session} = state;
                this.store.dispatch(connecting());
                this.launch(session).then(
                    () => this.onConnected(session),
                    error => this.onConnectionError(error));
                break;
        }
    }

    private async launch(session: ISession): Promise<void> {
        let app: App = this as App;

        window['app'] = app;

        let profile = {};

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
            app.me = window['me'] = new Me(this.calls, profile);

            window.onbeforeunload = function () {
                if (app.api.sessionStarted) {
                    app.api.disconnect();
                }
            };

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

            if (me.contacts.length) {
                start();
            } else {
                me.contacts.once('loaded', start);
            }
        }))();
    }

    private onConnected(session: ISession) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(session));
        browserHistory.push('/');
    }

    private onConnectionError(error: any) {
        console.error(error);
        // TODO: Go back to the login page telling the user what the error is. ~ F
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
    api: any;
    private id: any;
    timeInterval: any;
    currentPage: any;
    state: any;
    history: any;
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
