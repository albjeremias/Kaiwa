import React = require('react');
import {connect} from 'react-redux';

import {IApplicationState} from '../redux/Application';
import {ISession} from '../redux/Session';

interface IConnectingProps {
    session: ISession;
}

class ConnectingView extends React.Component<IConnectingProps, void> {
    render() {
        const {jid} = this.props.session;
        return (
            <section className='content box'>
                <div className='head'>
                    <h2>Connecting...</h2>
                </div>
                <div className='content'>
                    Connecting as {jid} {/* TODO: Add cancel button. ~ F */}
                </div>
            </section>
        );
    }
}

function stateToProps(state: IApplicationState): IConnectingProps {
    return {session: state.session};
}

export default connect(stateToProps)(ConnectingView);
