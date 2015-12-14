import {Component} from 'react'

export interface MucRosterItemProperties {
    item: any
}

export default class MucRosterItem extends Component<MucRosterItemProperties,{}>{
    
    handleClick() {
        
    }
    
    render() {
        return (
            <li className="online" onClick={this.handleClick}>
                <div className="name"></div>
            </li>
        )
        
    }
}

// var _ = require('underscore');
// var HumanView = require('human-view');
// var templates = require('../templates');

// module.exports = HumanView.extend({
//     template: templates.includes.mucRosterItem,
//     events: {
//         'click': 'handleClick'
//     },
//     classBindings: {
//         show: '',
//         chatState: '',
//         idle: ''
//     },
//     textBindings: {
//         mucDisplayName: '.name'
//     },
//     render: function () {
//         this.renderAndBind({contact: this.model});
//         return this;
//     },
//     handleClick: function (e) {
//         this.parent.trigger('rosterItemClicked', this.model.mucDisplayName);
//     }
// });
