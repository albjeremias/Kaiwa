import React = require('react');

export interface MucListItemProperties {
    contact: any;
    joinRoom: () => Promise<any>;
    leaveRoom: () => Promise<any>;
    openRoom: () => Promise<any>;
}

export default class MucListItem extends React.Component<MucListItemProperties, {}> {
    render() {
        return (
            <li className='contact' onClick={this.props.openRoom}>
                <div className='wrap'>
                    <i className='remove fa fa-times-circle' onClick={this.props.leaveRoom} />
                    <i className='join fa fa-sign-in' onClick={this.props.joinRoom} />
                    <div className='unread'>{this.props.contact.unreadCount}</div>
                    <span className='name'>{this.props.contact.displayName}</span>
                </div>
            </li>
        );
    }
}

// module.exports = HumanView.extend({
//     template: templates.includes.mucListItem,
//     classBindings: {
//         activeContact: '',
//         hasUnread: '',
//         joined: '',
//         persistent: ''
//     },
//     textBindings: {
//         displayName: '.name',
//         displayUnreadCount: '.unread'
//     },
//     events: {
//         'click': 'handleClick',
//         'click .join': 'handleJoinRoom',
//         'click .remove': 'handleLeaveRoom'
//     },
//     render: function () {
//         this.renderAndBind({contact: this.model});
//         return this;
//     },
//     handleClick: function (e) {
//         app.navigate('groupchat/' + encodeURIComponent(this.model.jid));
//     },
//     handleJoinRoom: function (e) {
//         this.model.join();
//     },
//     handleLeaveRoom: function (e) {
//         var  muc = this.model;
// 	muc.leave();
//     }
// });
