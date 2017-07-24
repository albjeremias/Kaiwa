import React = require('react');
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {Router, Route, IndexRoute, browserHistory} from 'react-router';
import {createStore} from 'redux';

import App from './models/App';
import {reducer} from './redux/Application';
import Connecting from './views/Connecting';
import {Utils} from './views/utils';
import {Login} from './views/Login';
import {App as AppView} from './views/app';
import {Home} from './views/home';
import {Settings} from './views/settings';
import {Chat} from './views/chat';
import {GroupChat} from './views/groupchat';
import {Logout} from './views/logout';

const store = createStore(reducer);
const app = new App(store);

render((
    <Provider store={store}>
        <Router history={browserHistory}>
            <Route path='/login' component={Login}/>
            <Route path='/connecting' component={Connecting}/>
            <Route path='/' component={AppView} onEnter={Utils.requireAuth}>
                <IndexRoute component={Home}/>
                <Route path='settings' component={Settings}/>
                <Route path='chat/:jid' component={Chat}/>
                <Route path='groupchat/:jid' component={GroupChat}/>
                <Route path='logout' component={Logout}/>
            </Route>
        </Router>
    </Provider>
), document.getElementById('root'));
