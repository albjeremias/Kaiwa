import classNames = require('classnames');
import React = require('react');

import Resource from '../models/resource';

export interface MucRosterItemProperties {
    resource: Resource;
}

export default class MucRosterItem extends React.Component<MucRosterItemProperties, {}> {

    handleClick() {
//         this.parent.trigger('rosterItemClicked', this.model.mucDisplayName);
    }

    render() {
        const {resource} = this.props;
        const classes = classNames({
            'online': true,
            'show': !!resource.show,
            'chatState': !!resource.chatState,
            'idle': !!resource.idle
        });

        return (
            <li className={classes} onClick={this.handleClick}>
                <div className='name'>{resource.mucDisplayName}</div>
            </li>
        );
    }
}
