global.Buffer = global.Buffer || require('buffer').Buffer;

// TODO: Uncomment these. ~ F
//import ApplicationView from './views/appView'
import { render } from 'react-dom';
import { Router, Route, hashHistory } from 'react-router';
import { Login } from './views/login';

$(() =>
    render((
        <Router history={hashHistory}>
            <Route path="/" component={Login} />
        </Router>
    ), document.getElementById('application'))); // TODO: There should be path="/" component={App} here ~ F
// TODO: Uncomment these. ~ F
//import App from './models/app'
//
//const application = new App()
//
//$(() => renderDOM(<ApplicationView app={application}/>, document.getElementById("application")))
