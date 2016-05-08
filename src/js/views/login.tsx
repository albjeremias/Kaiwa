import { Component, StatelessComponent } from 'react'

interface IFieldProps {
    className?: string;
    type?: string;
    id: string;
    label?: string;
    placeholder?: string;
    tabIndex?: number;
    autoFocus?: boolean;
    title?: string;
}

class Field extends Component<IFieldProps, {}> {
    getDefaultProps(): IFieldProps {
        return {
            id: '',
            type: 'text',
            autoFocus: false
        };
    }

    render() {
        const props = this.props;
        const className = 'fieldContainer ' + props.className;
        const label = <label htmlFor={props.id}>{props.label}</label>;
        const input = <input type={props.type}
                             id={props.id}
                             placeholder={props.placeholder}
                             tabIndex={props.tabIndex}
                             autoFocus={props.autoFocus} />;
        if (props.type === 'checkbox') {
            return <div className={className} title={props.title}>
                {input}
                {label}
            </div>;
        }


        return <div className={className} title={props.title}>
            {label}
            {input}
        </div>;
    }
}

export class Login extends Component<{}, {}> {
    render() {
        return <section className="loginbox content box">
            <div className="head">
                <h2>Log in</h2>
            </div>
            <div className="content">
                <form id="login-form">
                    <Field id="jid" label="Username" placeholder="you" tabIndex={1} autoFocus={true} />
                    <Field id="password" label="Password" placeholder="•••••••••••••" tabIndex={2} />
                    <Field id="connURL" className="fieldContainerWSS" label="WebSocket or BOSH URL" placeholder="wss://aweso.me:5281/xmpp-websocket" tabIndex={3} />
                    <Field id="public-computer" label="Public computer" type="checkbox" tabIndex={4} title="Do not remember password" className="checkbox" />

                    <button type="submit" tabIndex={5} className="primary">Go!</button>
                </form>
            </div>
        </section>
    }
}

/* TODO:
block scripts
    script(src="config.js")
    script(src="js/login.js")
    script.
        if ("#{config.server.wss}".length == 0) {
            document.getElementsByClassName('fieldContainerWSS').forEach(function (e) {
                e.style.display = 'block';
            });
        }
~ F */
