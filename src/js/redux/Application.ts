import {ISession} from './Session';

export interface IApplicationState {
    session: ISession;
}

export function kaiwa(state: IApplicationState, action: any): IApplicationState {
    console.log(state, action);
    return state;
}
