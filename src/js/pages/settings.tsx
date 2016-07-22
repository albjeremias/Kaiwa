/*global app, me, client, Resample*/
"use strict";

import App from '../models/app'

declare const app: App

import {Page, PageMixIn} from './base'
import {Component} from 'react'

export interface SettingsPageProperties {

}

export interface SettingsPageState {

}

export default class SettingsPage
    extends Component<SettingsPageProperties, {}>
    implements Page {

    constructor(props?: SettingsPageProperties, context?: any) {
        super(props, context)
        _.extend(this, PageMixIn.call(this))
    }

    componentDidMount() {
        this.setState({} as SettingsPageState)
    }

    enableAlerts () {
        if (app.notifications.permissionNeeded()) {
            app.notifications.requestPermission(function (perm) {
                if (perm === 'granted') {
                    app.notifications.create('Ok, sweet!', {
                        body: "You'll now be notified of stuff that happens."
                    });
                }
            });
        }
    }

    installFirefox () {
        if (!app.desktop.installed) {
            app.desktop.install();
        } else {
            app.desktop.uninstall();
        }
    }

    handleSoundNotifs (e) {
        app.me.setSoundNotification(!app.me.soundEnabled);
    }

    handleAvatarChange (e) {
        var file;

        e.preventDefault();

        if (e.dataTransfer) {
            file = e.dataTransfer.files[0];
        } else if (e.target.files) {
            file = e.target.files[0];
        } else {
            return;
        }

        if (file.type.match('image.*')) {
            var fileTracker = new FileReader();
            fileTracker.onload = function () {
                app.me.publishAvatar(this.result);
            };
            fileTracker.readAsDataURL(file);
        }
    }

    handleAvatarChangeDragOver (e) {
        e.preventDefault();
        return false;
    }


    handleDisconnect (e) {
        client.disconnect();
    }

    render() {
        return (
            <section className="page main" onDrop={this.handleAvatarChange} onDragOver={this.handleAvatarChangeDragOver}>
                <h1 id="title">Settings</h1>
                <div id="avatarChanger">
                    <h4>Change Avatar</h4>
                    <div className="uploadRegion">
                        <p>Drag and drop a new avatar here</p>
                        <img src="" />
                        <form>
                            <input id="uploader" type="file" onChange={this.handleAvatarChange} />
                        </form>
                    </div>
                </div>
                <div>
                    <h4>Desktop Integration</h4>
                    <button className="enableAlerts" onClick={this.enableAlerts}></button>
                    <button className="primary installFirefox" onClick={this.installFirefox}>Install app</button>
                    <button className="soundNotifs">sound notifications</button>
                </div>
                <div>
                    <button className="disconnect" onClick={this.handleDisconnect}>Disconnect</button>
                    <button className="primary logout">Logout</button>
                </div>
            </section>
        )
    }

    show
    hide
}


// module.exports = BasePage.extend({
//     template: templates.pages.settings,
//     classBindings: {
//         shouldAskForAlertsPermission: '.enableAlerts',
//         soundEnabledClass: '.soundNotifs'
//     },
//     srcBindings: {
//         avatar: '#avatarChanger img'
//     },
//     textBindings: {
//         status: '.status'
//     },

// });
