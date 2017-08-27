import * as React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import {reducer} from './redux/Application';
import RootView from './views/Root';

const store = createStore(reducer);

render((
    <Provider store={store}>
        <RootView />
    </Provider>
), document.getElementById('root'));
