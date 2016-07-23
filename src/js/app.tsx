import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {Router, Route, IndexRoute, browserHistory} from 'react-router';
import {createStore} from 'redux';

import {IApplicationState, kaiwa} from './redux/Application';
import {ISession} from './redux/Session';
import {Utils}        from './views/utils';
import {Login}        from './views/login';
import {App}          from './views/app';
import {Home}         from './views/home';
import {Settings}     from './views/settings';
import {Chat}         from './views/chat';
import {GroupChat}    from './views/groupchat';
import {Logout}       from './views/logout';

const initialSession: ISession = localStorage.getItem('session') || {};
const initialState: IApplicationState = {session: initialSession};
const store = createStore(kaiwa, initialState);

render((
    <Provider store={store}>
        <Router history={browserHistory}>
            <Route path='/login' component={Login}/>
            <Route path='/' component={App} onEnter={Utils.requireAuth}>
                <IndexRoute component={Home}/>
                <Route path='settings' component={Settings}/>
                <Route path='chat/:jid' component={Chat}/>
                <Route path='groupchat/:jid' component={GroupChat}/>
                <Route path='logout' component={Logout}/>
            </Route>
        </Router>
    </Provider>
), document.getElementById('root'));
