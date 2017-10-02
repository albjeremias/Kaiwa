import * as React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {applyMiddleware, createStore} from 'redux';
import thunk from 'redux-thunk';

import {reducer} from './redux/Application';
import RootView from './views/Root';

const store = createStore(reducer, applyMiddleware(thunk));

render((
    <Provider store={store}>
        <RootView />
    </Provider>
), document.getElementById('root'));
