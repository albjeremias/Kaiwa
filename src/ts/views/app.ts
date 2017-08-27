import { Component } from 'react';

const StanzaIO = require('stanza.io');

export class App extends Component<{}, any> {
    constructor () {
        super();

        console.log('Init App');

        const session = localStorage.getItem('session');
        if (session) {
            this.state.session = JSON.parse(session);
        }
    }

    render () {
        return null;
    }
}
