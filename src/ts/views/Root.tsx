import * as React from 'react';
import {connect} from 'react-redux';

import {IApplicationState} from '../redux/Application';
import {ApplicationStatus} from '../redux/Status';
import Connecting from './Connecting';
import Login from './Login';
import Main from './Main';

interface Props {
    state: ApplicationStatus;
}

const view = ({ state }: Props) => {
    switch (state) {
        case ApplicationStatus.Started:
        case ApplicationStatus.ConnectionError:
            return <Login />;
        case ApplicationStatus.Connecting:
            return <Connecting />;
        case ApplicationStatus.Connected:
            return <Main />;
        default:
            throw new Error('Invalid state: ' + state);
    }
};

export default connect((state: IApplicationState) => ({ state: state.status.type }))(view);
