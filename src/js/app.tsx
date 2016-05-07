/// <reference path="../../typings/main.d.ts" />
'use strict';

global.Buffer = global.Buffer || require('buffer').Buffer;

import ApplicationView from './views/appView'
import {render as renderDOM} from 'react-dom'
import App from './models/app'

const application = new App()

$(() => renderDOM(<ApplicationView app={application}/>, document.getElementById("application")))
