import {IAction, ISessionAction} from './Actions';

export enum ApplicationState {
    Started,
    Connecting,
    Connected,
    ConnectionError
}

export function reducer(state: ApplicationState, action: IAction): ApplicationState {
    if (state === undefined) {
        return ApplicationState.Started;
    }

    switch (action.type) {
        case 'LOGIN': return ApplicationState.Connecting;
        case 'CONNECTED': return ApplicationState.Connected;
        case 'CONNECTION_ERROR': return ApplicationState.ConnectionError;
    }

    return state;
}
