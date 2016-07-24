import React = require('react');
import {connect} from 'react-redux';

import {IApplicationState} from '../redux/Application';
import {ISession} from '../redux/Session';

interface IConnectingProps {
    session: ISession;
}

class ConnectingView extends React.Component<IConnectingProps, void> {
    render() {
        return (
            <section className='content box'>
                <div className='head'>
                    <h2>Connecting</h2>
                </div>
                <div className='content'>

                </div>
            </section>
        );
    }
}

function stateToProps(state: IApplicationState): IConnectingProps {
    return {session: state.session};
}

export default connect(stateToProps)(ConnectingView);
