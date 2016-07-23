import Action = Redux.Action;

export interface ISession {
    jid?: string;
    password?: string;
    server?: string;
    connURL?: string;
    wsURL?: string;
    boshURL?: string;
    transport?: string;
}

interface ISessionAction extends Action {
    type: 'LOGIN';
    session: ISession;
}

export function login(session: ISession): ISessionAction {
    return {type: 'LOGIN', session};
}

function getDefaultSession() {
    const {wss} = KAIWA_CONFIG;
    const session: ISession = {
        connURL: wss
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

const LOCAL_STORAGE_KEY = 'session';
export function reducer(state: ISession, action: ISessionAction): ISession {
    console.log(state, action);
    if (state === undefined) {
        return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || getDefaultSession();
    }

    const {session} = action;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(session));
    return session; // TODO: Switch to "/" state ~ F
}
