import {ISession, getInitialSession} from './Session';

export enum ConnectionState {
    Disconnected,
    Connecting,
    Connected
}

export interface IApplicationState {
    connectionState: ConnectionState;
    session: ISession;
    stateMessage?: string;
    client?: XMPP.Client;
}

export function getInitialState(): IApplicationState {
    return {
        connectionState: ConnectionState.Disconnected,
        session: getInitialSession()
    };
}
