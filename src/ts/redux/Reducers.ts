import update = require('react-addons-update');

import {Action, IConnectionAction} from './Actions';
import {ConnectionState, IApplicationState, getInitialState} from './State';

export function reducer(state: IApplicationState, action: Action): IApplicationState {
    if (state === undefined) {
        return getInitialState();
    }

    switch (action.type) {
        case 'CONNECTING':
            return update(state, {state: {$set: ConnectionState.Connecting}});
        case 'CONNECTED':
            return update(state, {state: {$set: ConnectionState.Connected}});
        case 'CONNECTION_ERROR':
            const {client, message} = action as IConnectionAction;
            return update(state, {
                state: {$set: ConnectionState.Disconnected},
                stateMessage: {$set: message},
                client: {$set: null}
            });
    }
}
