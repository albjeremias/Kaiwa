import * as React from 'react';
import {connect} from 'react-redux';

import {IApplicationState} from '../redux/Application';
import {ApplicationState} from '../redux/State';
import Connecting from './Connecting';
import Login from './Login';
import Main from './Main';

interface Props {
    state: ApplicationState;
}

const view = ({ state }: Props) => {
    switch (state) {
        case ApplicationState.Started:
            return <Login />;
        case ApplicationState.Connecting:
            return <Connecting />;
        case ApplicationState.Connected:
            return <Main />;
        default:
            throw new Error('Invalid state: ' + state);
    }
};

export default connect((state: IApplicationState) => ({ state: state.state }))(view);
