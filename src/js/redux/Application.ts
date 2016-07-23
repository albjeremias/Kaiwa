import {combineReducers} from 'redux';

import {ISession, reducer as session} from './Session';

export interface IApplicationState {
    session: ISession;
}

export const kaiwa = combineReducers({session});
