import update = require('react-addons-update');
import Redux = require('redux');

import {IAction, ISessionAction} from './Actions';

import Action = Redux.Action;

export interface ISession {
    jid: string;
    password: string;
    connURL?: string;
    wsURL?: string;
    boshURL?: string;
    transport?: string;
}

function getDefaultSession() {
    const {wss} = KAIWA_CONFIG;
    const session: ISession = {
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

export const LOCAL_STORAGE_KEY = 'session';
export function reducer(state: ISession, action: IAction): ISession {
    if (state === undefined) {
        const session = localStorage.getItem(LOCAL_STORAGE_KEY);
        return session ? JSON.parse(session) : getDefaultSession();
    }

    switch (action.type) {
        case 'LOGIN':
            let {session} = action as ISessionAction;
            if (KAIWA_CONFIG.domain && session.jid.indexOf('@') === -1) {
                const jid = `${session.jid}@${KAIWA_CONFIG.domain}`;
                session = update(session, {jid: {$set: jid}});
            }

            return session;
    }

    return state;
}
