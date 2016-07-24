import {combineReducers} from 'redux';

import {ISession, reducer as session} from './Session';
import {ApplicationState, reducer as state} from './State';

export interface IApplicationState {
    state: ApplicationState;
    session: ISession;
}

export const reducer = combineReducers<IApplicationState>({state, session});
