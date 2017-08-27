import {IAction, ISessionAction, ISessionErrorAction} from './Actions';

export enum ApplicationStateType {
    Started = 'Started',
    Connecting = 'Connecting',
    Connected = 'Connected',
    ConnectionError = 'ConnectionError'
}

export interface IApplicationState {
    type: ApplicationStateType;
}

export interface IApplicationErrorState extends IApplicationState {
    type: ApplicationStateType.ConnectionError;
    error: string;
}

export function reducer(state: IApplicationState, action: IAction): IApplicationState | IApplicationErrorState {
    if (state === undefined) {
        return { type: ApplicationStateType.Started };
    }

    switch (action.type) {
        case 'LOGIN': return { type: ApplicationStateType.Connecting };
        case 'CONNECTED': return { type: ApplicationStateType.Connected };
        case 'CONNECTION_ERROR':
            let {error} = action as ISessionErrorAction;
            return { type: ApplicationStateType.ConnectionError, error };
    }

    return state;
}
