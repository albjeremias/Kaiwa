import * as React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {applyMiddleware, createStore} from 'redux';
import thunk from 'redux-thunk';

import Application from './app/Application';
import {reducer} from './redux/Application';
import RootView from './views/Root';

const application = new Application();
const store = createStore(reducer(application), applyMiddleware(thunk));

render((
    <Provider store={store}>
        <RootView />
    </Provider>
), document.getElementById('root'));
