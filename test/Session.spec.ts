import * as test from 'tape';

import {reducer as session, ISession} from '../src/js/redux/Session';
import {ISessionAction} from "../src/js/redux/Actions";

test('reducer should return proper session after login', (t) => {
    const initialSession: ISession = {
        jid: 'foo',
        password: 'x'
    };
    const action: ISessionAction = {
        type: 'LOGIN',
        session: initialSession
    };

    const result = session(initialSession, action);
    t.deepEqual(result, {
        jid: `foo@${KAIWA_CONFIG.domain}`,
        password: 'x'
    });

    t.end();
});
