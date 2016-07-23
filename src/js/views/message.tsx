import {Component} from 'react';

export interface MessageProperties {
    message: any;
}

export default class Message extends Component<MessageProperties, {}> {
    render() {
        return (
            <li>
                <div className='message'>
                    <span className='timestamp'>{this.props.message.timestamp}</span>
                    <p className='body'>{this.props.message.body}</p>
                </div>
            </li>
        );
    }
}

// var _ = require('underscore');
// var HumanView = require('human-view');
// var templates = require('../templates');

// module.exports = HumanView.extend({
//     template: templates.includes.message,
//     initialize: function (opts) {
//         this.render();
//     },
//     classBindings: {
//         mine: '.message',
//         receiptReceived: '.message',
//         pending: '.message',
//         delayed: '.message',
//         edited: '.message',
//         meAction: '.message'
//     },
//     textBindings: {
//         body: '.body',
//         formattedTime: '.timestamp'
//     },
//     render: function () {
//         this.renderAndBind({message: this.model});
//         return this;
//     }
// });
