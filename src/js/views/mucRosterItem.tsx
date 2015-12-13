import {createClass} from 'react'

export interface MucRosterItemProperties {
    item: any
}

const MucRosterItem = createClass<MucRosterItemProperties,{}>({
    
    handleClick() {
        
    },
    
    render() {
        return (
            <li className="online" onClick={this.handleClick}>
                <div className="name"></div>
            </li>
        )
        
    }
})

export default MucRosterItem


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
