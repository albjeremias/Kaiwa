import Redux = require('redux');
import {ThunkAction} from 'redux-thunk';

import App from '../app/Application';
import {writeSession} from '../storage/localStorage';
import {ISession} from './Session';

import Action = Redux.Action;

export interface IAction extends Action {
    type: string;
}

export interface ISessionAction extends IAction {
    type: 'CONNECTING' | 'CONNECTED' | 'CONNECTION_ERROR';
    session: ISession;
}

export interface ISessionErrorAction extends ISessionAction {
    type: 'CONNECTION_ERROR';
    error: string;
}

const connecting = (session: ISession): ISessionAction => ({type: 'CONNECTING', session});
const connected = (session: ISession): ISessionAction => ({type: 'CONNECTED', session});
const connectionError = (session: ISession, error: string): ISessionErrorAction => ({
    type: 'CONNECTION_ERROR',
    session,
    error
});

export function login(session: ISession) {
    return async (dispatch: Redux.Dispatch<ISession>) => {
        dispatch(connecting(session));
        try {
            const app = new App();
            await app.launch(session);
            writeSession(session);
            dispatch(connected(session));
        } catch (e) {
            console.error(e);
            dispatch(connectionError(session, e.toString()));
        }
    };
}
