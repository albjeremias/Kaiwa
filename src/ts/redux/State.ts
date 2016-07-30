import {IAction} from './Actions';

export enum ApplicationState {
    Started,
    Login,
    Connecting,
    Connected
}

export function reducer(state: ApplicationState, action: IAction): ApplicationState {
    if (state === undefined) {
        return ApplicationState.Started;
    }

    switch (action.type) {
        case 'LOGIN': return ApplicationState.Login;
        case 'CONNECTING': return ApplicationState.Connecting;
    }

    return state;
}
