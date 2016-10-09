import Redux = require('redux');

import {ISession} from './Session';

import Action = Redux.Action;

export interface IAction extends Action {
    type: 'LOGIN' | 'CONNECTING';
}

export interface ISessionAction extends IAction {
    type: 'LOGIN';
    session: ISession;
}

export function login(session: ISession): ISessionAction {
    return {type: 'LOGIN', session};
}

export function connecting(): IAction {
    return {type: 'CONNECTING'};
}
