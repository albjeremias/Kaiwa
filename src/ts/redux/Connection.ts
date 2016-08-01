import update = require('react-addons-update');
import XMPP = require('stanza.io');

const pushNotifications = require('../../js/helpers/pushNotifications');
import xmppEventHandlers = require('../helpers/xmppEventHandlers');
import {connectionStatus} from './Actions';
import {IApplicationState} from './Application';
import {ISession} from './Session';

import Client = XMPP.Client;

function createClient(session: ISession): Client {
    console.log(`Connecting to ${session.wsURL}`);
    const options = update(session, {
        useStreamManagement: {$set: false},
        sasl: {$set: KAIWA_CONFIG.sasl}
    });
    // TODO: Disabling useStreamManagement is a temporary solution because
    // this feature is bugged on node 4.0. Need to investigate. ~ F

    return XMPP.createClient(options);
}

function connect(client: XMPP.Client): Promise<XMPP.Client> {
    client.connect();
    return new Promise((resolve, reject) => {
        let finished = false;
        client.once('session:started', () => {
            finished = true;
            resolve();
        });
        client.once('auth:fail disconnected', () => {
            if (!finished) {
                // TODO: Use cancelable Promise? ~ F
                finished = true;
                reject(arguments);
            }
        });
    });
}

export function login(session: ISession): (dispatch: Redux.Dispatch<IApplicationState>) => Promise<void> {
    return async (dispatch) => {
        try {
            const client = createClient(session);
            dispatch(connectionStatus('CONNECTING', client));

            await connect(client);
            client.use(pushNotifications);
            xmppEventHandlers(client, dispatch);

            dispatch(connectionStatus('CONNECTED', client));
        } catch (error) {
            dispatch(connectionError(error.toString()));
        }
    };
}
