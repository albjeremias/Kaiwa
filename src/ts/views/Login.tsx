import * as React from 'react';
import * as Redux from 'redux';
import {connect} from 'react-redux';

import {login} from '../redux/Actions';
import {IApplicationState} from '../redux/Application';
import {ISession} from '../redux/Session';

import Dispatch = Redux.Dispatch;

class Field extends React.Component<{
    type?: string;
    id: string;
    label?: string;
    placeholder?: string;
    tabIndex?: number;
    autoFocus?: boolean;
    title?: string;
    value?: any;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
    session: ISession;
    onLogin: (session: ISession) => void;
}

class LoginView extends React.Component<LoginProps, ISession> {
    constructor(props: LoginProps) {
        super();
        this.state = props.session;
    }

    handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        this.props.onLogin(this.state);
    }

    handleChange(event: React.FormEvent<HTMLInputElement>) {
        const target = event.currentTarget;
        this.setState({
            [target.id]: target.value
        } as Pick<ISession, keyof ISession>);
    }

    render() {
        const showWssSelector = !KAIWA_CONFIG.wss;
        const session = this.state;
        return (
            <section className='loginbox content box'>
                <div className='head'>
                    <h2>Log in</h2>
                </div>

                {localStorage.getItem('auth-failed') ? (
                        <section className='aith-failed content box'>
                            <h2>Incorrect username/password pair</h2>
                        </section>
                    ) : undefined}

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

function stateToProps(state: IApplicationState): Partial<LoginProps> {
    return {session: state.session};
}

function dispatchToProps(dispatch: Dispatch<IApplicationState>): Partial<LoginProps> {
    return {
        onLogin: (session) => dispatch(login(session))
    };
}

export const Login = connect(stateToProps, dispatchToProps)(LoginView);
