import {ISession} from './Session';

import Action = Redux.Action;

export interface ILoginAction {
    type: 'LOGIN';
    session: ISession;
}

type ConnectionStatus = 'CONNECTING'|'CONNECTED'|'CONNECTION_ERROR';

export interface IConnectionAction {
    type: ConnectionStatus;
    client: XMPP.Client;
    message?: string;
}

export type Action = ILoginAction|IConnectionAction;

export function login(session: ISession): ILoginAction {
    return {type: 'LOGIN', session};
}

export function connectionStatus(
    status: ConnectionStatus,
    client: XMPP.Client,
    message?: string): IConnectionAction {
    return {type: status, client, message};
}
