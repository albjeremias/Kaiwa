import * as React from 'react';
import {connect} from 'react-redux';

import {IApplicationState} from '../redux/Application';
import {ApplicationStateType} from '../redux/State';
import Connecting from './Connecting';
import Login from './Login';
import Main from './Main';

interface Props {
    state: ApplicationStateType;
}

const view = ({ state }: Props) => {
    switch (state) {
        case ApplicationStateType.Started:
        case ApplicationStateType.ConnectionError:
            return <Login />;
        case ApplicationStateType.Connecting:
            return <Connecting />;
        case ApplicationStateType.Connected:
            return <Main />;
        default:
            throw new Error('Invalid state: ' + state);
    }
};

export default connect((state: IApplicationState) => ({ state: state.state.type }))(view);
