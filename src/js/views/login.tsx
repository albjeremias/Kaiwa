import {Component} from 'react';
import update = require('react-addons-update');
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';

import {IApplicationState} from '../redux/Application';
import {ISession, login} from '../redux/Session';

import Dispatch = Redux.Dispatch;

class Field extends Component<{
    type?: string;
    id: string;
    label?: string;
    placeholder?: string;
    tabIndex?: number;
    autoFocus?: boolean;
    title?: string;
    value?: any;
    onChange?: any;
}, {}> {
    static defaultProps = {
        id: '',
        type: 'text',
        autoFocus: false
    };

    render() {
        const props = this.props;
        const isCheckBox = props.type === 'checkbox';
        const className = 'fieldContainer' + (isCheckBox ? ' checkbox' : '');
        const label = <label key='label' htmlFor={props.id}>{props.label}</label>;
        const input = <input key='input'
                             type={props.type}
                             id={props.id}
                             placeholder={props.placeholder}
                             tabIndex={props.tabIndex}
                             autoFocus={props.autoFocus}
                             value={props.value}
                             onChange={props.onChange}/>;
        const components = isCheckBox ? [input, label] : [label, input];

        return (
            <div className={className} title={props.title}>
                {components}
            </div>
        );
    }
}

interface LoginProps {
    session?: ISession;
    onLogin?: (session: ISession) => void;
}

class LoginView extends Component<LoginProps, ISession> {
    constructor(props: LoginProps) {
        super();
        console.log(props);
        this.state = props.session;
    }

    handleSubmit(event) {
        event.preventDefault();

        console.log(this, this.state);

        // if (KAIWA_CONFIG.domain && this.state.jid.indexOf('@') === -1)
        //     this.state.jid += '@' + KAIWA_CONFIG.domain;
        //
        // if (KAIWA_CONFIG.wss)
        //     this.state.connURL = KAIWA_CONFIG.wss;
        //
        // if (this.state.connURL.indexOf('http') === 0) {
        //     this.state.boshURL = this.state.connURL;
        //     this.state.transport = 'bosh';
        // } else if (this.state.connURL.indexOf('ws') === 0) {
        //     this.state.wsURL = this.state.connURL;
        //     this.state.transport = 'websocket';
        // }

        localStorage.setItem('session', JSON.stringify(this.state));

        browserHistory.push('/');
    }

    handleChange(event) {
        const {session} = this.props;
        const newState = update(session, { $set: { [event.target.id]: event.target.value } });
        this.setState(newState);
    }

    render() {
        const showWssSelector = !KAIWA_CONFIG.wss;
        const {session} = this.props;
        return (
            <section className='loginbox content box'>
                <div className='head'>
                    <h2>Log in</h2>
                </div>
                <div className='content'>
                    <form id='login-form' onSubmit={e => this.handleSubmit(e)}>
                        <Field id='jid'
                               label='Username'
                               placeholder='you'
                               tabIndex={1}
                               autoFocus={true}
                               value={session.jid}
                               onChange={e => this.handleChange(e)}/>
                        <Field id='password'
                               type='password'
                               label='Password'
                               placeholder='••••••••'
                               tabIndex={2}
                               value={session.password}
                               onChange={e => this.handleChange(e)}/>
                        {showWssSelector
                            ? <Field id='connURL'
                                     label='WebSocket or BOSH URL'
                                     placeholder='wss://aweso.me:5281/xmpp-websocket'
                                     tabIndex={3}
                                     value={session.connURL}
                                     onChange={e => this.handleChange(e)}/>
                            : null}
                        <Field id='public-computer'
                               label='Public computer'
                               type='checkbox'
                               tabIndex={4}
                               title='Do not remember password'/>

                        <button type='submit' tabIndex={5} className='primary'>Go!</button>
                    </form>
                </div>
            </section>
        );
    }
}

function stateToProps(state: IApplicationState): LoginProps {
    return {session: state.session};
}

function dispatchToProps(dispatch: Dispatch<IApplicationState>): LoginProps {
    return {
        onLogin: (session) => dispatch(login(session))
    };
}

export const Login = connect(stateToProps, dispatchToProps)(LoginView);
