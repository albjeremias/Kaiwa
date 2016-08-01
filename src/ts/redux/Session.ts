import update = require('react-addons-update');

export interface ISession {
    jid: string;
    password: string;
    connURL?: string;
    wsURL?: string;
    boshURL?: string;
    transport?: string;
}

export const LOCAL_STORAGE_KEY = 'session';

export function getInitialSession(): ISession {
    let session = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) as ISession;
    if (session !== undefined) {
        return session;
    }

    const {wss} = KAIWA_CONFIG;
    session = {
        connURL: wss,
        jid: '',
        password: ''
    };
    if (wss && wss.indexOf('http') === 0) {
        session.boshURL = wss;
        session.transport = 'bosh';
    } else if (wss.indexOf('ws') === 0) {
        session.wsURL = wss;
        session.transport = 'websocket';
    }

    return session;
}
