import {Component, createClass} from 'react';

import App from '../models/app';
import Settings from '../pages/settings';

export interface Properties {
    app: App;
}
export interface State {
    error: Error;
}

const ApplicationView = createClass<Properties, State>({
    getInitialState() {
        return { } as State;
    },

    componentDidMount() {
        this.init();
    },

    render() {
        const {error} = this.state;

        if (_.isUndefined(error)) return <LoaderView />;
        if (error === null) return <Settings/>;
        if (error instanceof Error) return <ErrorView error={error}/>;

        return <div>How did u get here?</div>;
    },

    async init(): Promise<App|Error> {
        const props = this.props;
        const app = props.app;

        try {
            const loadedApp: App = await app.launch();
            this.setState({ error: null });
            return loadedApp;
        }

        catch (e) {
            this.setState({ error: e });
            return Promise.reject<Error>(e);
        }
    }
});
export default ApplicationView;

interface ErrorProperties {
    error: Error;
}

class ErrorView extends Component<ErrorProperties, {}> {

    render() {
        const defaultErrorMsg = 'Error occured';
        const {error = {} as Error} = this.props;
        const {message = defaultErrorMsg} = error;

        return <div>{message}</div>;
    }
}

class LoaderView extends Component<{}, {}> {
    render() {
        return (
            <div>
                <header>
                    <img id='logo' src='images/logo-big.png' width='250' height='77' alt='Kaiwa' />
                </header>
                <section className='box connect'>
                    <h2>Connection...</h2>
                    <a className='button secondary' href='logout.html'>Cancel</a>
                </section>
            </div>
        );
    }
}
