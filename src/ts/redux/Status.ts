import {IAction, ISessionAction, ISessionErrorAction} from './Actions';

export enum ApplicationStatus {
    Started = 'Started',
    Connecting = 'Connecting',
    Connected = 'Connected',
    ConnectionError = 'ConnectionError'
}

export interface ISimpleApplicationStatus {
    type: ApplicationStatus.Started | ApplicationStatus.Connecting | ApplicationStatus.Connected;
}

export interface IApplicationErrorStatus {
    type: ApplicationStatus.ConnectionError;
    error: string;
}

export type IApplicationStatus = ISimpleApplicationStatus | IApplicationErrorStatus;

function foo(status: IApplicationStatus) {
    switch (status.type) {
        case ApplicationStatus.ConnectionError:
            return status.error;
    }
}

export function reducer(state: IApplicationStatus, action: IAction): IApplicationStatus {
    if (state === undefined) {
        return { type: ApplicationStatus.Started };
    }

    switch (action.type) {
        case 'LOGIN': return { type: ApplicationStatus.Connecting };
        case 'CONNECTED': return { type: ApplicationStatus.Connected };
        case 'CONNECTION_ERROR':
            let {error} = action as ISessionErrorAction;
            return { type: ApplicationStatus.ConnectionError, error };
    }

    return state;
}
