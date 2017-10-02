import {combineReducers} from 'redux';

import Application from '../app/Application';
import {ISession, reducer as session} from './Session';
import {IApplicationStatus, reducer as status} from './Status';

export interface IApplicationState {
    application: Application;
    status: IApplicationStatus;
    session: ISession;
}

export const reducer = (application: Application) => {
    let appReducer = () => application;
    return combineReducers<IApplicationState>({application: appReducer, status, session});
};
