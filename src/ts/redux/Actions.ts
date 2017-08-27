import Redux = require('redux');
import {ThunkAction} from 'redux-thunk';

import App from '../models/App';
import {writeSession} from '../storage/localStorage';
import {ISession} from './Session';

import Action = Redux.Action;

export interface IAction extends Action {
    type: string;
}

export interface ISessionAction extends IAction {
    type: 'LOGIN' | 'CONNECTED' | 'CONNECTION_ERROR';
    session: ISession;
}

export function login(session: ISession) {
    return async (dispatch: Redux.Dispatch<ISession>) => {
        dispatch({type: 'CONNECTING', session});
        try {
            const app = new App();
            await app.launch(session);
            writeSession(session);
            dispatch({type: 'CONNECTED', session});
        } catch (e) {
            dispatch({type: 'CONNECTION_ERROR', session});
        }
    };
}
