import {IAction, ISessionAction} from './Actions';

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

export const LOCAL_STORAGE_KEY = 'session';
export function reducer(state: ISession, action: IAction): ISession {
    if (state === undefined) {
        return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || getDefaultSession();
    }

    switch (action.type) {
        case 'LOGIN': return (action as ISessionAction).session;
    }

    return state;
}
