/*global app, client, URL, me*/
"use strict";

var getUserMedia = require('getusermedia');
var fetchAvatar = require('../helpers/fetchAvatar');
var crypto = require('crypto');
var StanzaIo = require('stanza.io');

import App from './app'

declare const app: App

import Contacts from './contacts'
import Calls from './calls'
import Contact from './contact'
import MUCs from './mucs'
import MUC from './muc'
import ContactRequests from './contactRequests'

export default class Me {
    constructor(opts) {
        this.setAvatar(opts ? opts.avatarID : null);

        this.bind('change:jid', this.load, this);
        this.bind('change:hasFocus', function () {
            this.setActiveContact(this._activeContact);
        }, this);
        this.calls.bind('add remove reset', this.updateActiveCalls, this);
        this.bind('change:avatarID', this.save, this);
        this.bind('change:status', this.save, this);
        this.bind('change:rosterVer', this.save, this);
        this.bind('change:soundEnabled', this.save, this);
        this.contacts.bind('change:unreadCount', this.updateUnreadCount, this);
        app.state.bind('change:active', this.updateIdlePresence, this);
        app.state.bind('change:deviceIDReady', this.registerDevice, this);
    }
    
    setActiveContact (jid) {
        var prev = this.getContact(this._activeContact);
        if (prev) {
            prev.activeContact = false;
        }
        var curr = this.getContact(jid);
        if (curr) {
            curr.activeContact = true;
            curr.unreadCount = 0;
            this._activeContact = curr.id;
        }
    }
    
    getName () {
        return this.displayName;
    }
    
    getNickname () {
        return this.displayName != this.nick ? this.nick : '';
    }
    
    getAvatar () {
        return this.avatar;
    }
    
    setAvatar (id, type?, source?) {
        var self = this;
        fetchAvatar('', id, type, source, function (avatar) {
            self.avatarID = avatar.id;
            self.avatar = avatar.uri;
        });
    }
    
    publishAvatar (data) {
        if (!data) data = this.avatar;
        if (!data || data.indexOf('https://') != -1) return;

        var resampler = new Resample(data, 80, 80, function (data) {
            var b64Data = data.split(',')[1];
            var id = crypto.createHash('sha1').update(atob(b64Data)).digest('hex');
            app.storage.avatars.add({id: id, uri: data});
            client.publishAvatar(id, b64Data, function (err, res) {
                if (err) return;
                client.useAvatars([{
                  id: id,
                  width: 80,
                  height: 80,
                  type: 'image/png',
                  bytes: b64Data.length
                }]);
            });
        });
    }
    
    setSoundNotification(enable) {
        this.soundEnabled = enable;
    }
    
    getContact (jid, alt) {
        if (typeof jid === 'string') {
            if (SERVER_CONFIG.domain && jid.indexOf('@') == -1) jid += '@' + SERVER_CONFIG.domain;
            jid = new StanzaIo.JID(jid);
        }
        if (typeof alt === 'string') alt = new StanzaIo.JID(alt);

        if (this.isMe(jid)) {
            jid = alt || jid;
        }

        if (!jid) return;

        return this.contacts.get(jid.bare) ||
            this.mucs.get(jid.bare) ||
            this.calls.findWhere('jid', jid);
    }
    
    setContact (data, create) {
        var contact = this.getContact(data.jid);
        data.jid = data.jid.bare;

        if (contact) {
            contact.set(data);
            contact.save();
        } else if (create) {
            contact = new Contact(data);
            contact.inRoster = true;
            contact.owner = this.jid.bare;
            contact.save();
            this.contacts.add(contact);
        }
    }
    
    removeContact (jid) {
        var self = this;
        client.removeRosterItem(jid, function(err, res) {
            var contact = self.getContact(jid);
            self.contacts.remove(contact.jid);
            app.storage.roster.remove(contact.storageId);
        });
    }
    
    load () {
        if (!this.jid.bare) return;

        var self = this;

        app.storage.profiles.get(this.jid.bare, function (err, profile) {
            if (!err) {
                self.nick = self.jid.local;
                self.status = profile.status;
                self.avatarID = profile.avatarID;
                self.soundEnabled = profile.soundEnabled;
            }
            self.save();
            app.storage.roster.getAll(self.jid.bare, function (err, contacts) {
                if (err) return;

                contacts.forEach(function (contact) {
                    contact = new Contact(contact);
                    contact.owner = self.jid.bare;
                    contact.inRoster = true;
                    if (contact.jid.indexOf("@" + SERVER_CONFIG.domain) > -1)
                      contact.persistent = true;
                    contact.save();
                    self.contacts.add(contact);
                });
            });
        });

        this.mucs.once('loaded', function () {
            self.contacts.trigger('loaded');
        });
    }
    
    isMe (jid) {
        return jid && (jid.bare === this.jid.bare);
    }
    
    updateJid(newJid) {
        if (this.jid.domain && this.isMe(newJid)) {
            this.jid.full = newJid.full;
            this.jid.resource = newJid.resource;
            this.jid.unescapedFull = newJid.unescapedFull;
            this.jid.prepped = newJid.prepped;
        } else {
            this.jid = newJid;
            this.nick = this.jid.local;
        }
    }
    
    updateIdlePresence () {
        var update = {
            status: this.status,
            show: this.show,
            caps: app.api.disco.caps
        };

        if (!app.state.active) {
            update['idle'] = {since: app.state.idleSince};
        }

        app.api.sendPresence(update);
    }
    
    updateUnreadCount () {
        var unreadCounts = this.contacts.pluck('unreadCount');
        var count = unreadCounts.reduce(function (a, b) { return a + b; });
        if (count === 0) {
            count = '';
        }
        app.state.badge = '' + count;
    }
    
    updateActiveCalls () {
        app.state.hasActiveCall = !!this.calls.length;
    }
    
    save () {
        var data = {
            jid: this.jid.bare,
            avatarID: this.avatarID,
            status: this.status,
            rosterVer: this.rosterVer,
            soundEnabled: this.soundEnabled
        };
        app.storage.profiles.set(data);
    }
    
    cameraOn () {
        var self = this;
        getUserMedia(function (err, stream) {
            if (err) {
                console.error(err);
            } else {
                self.stream = stream;
            }
        });
    }
    
    cameraOff () {
        if (this.stream) {
            this.stream.stop();
            this.stream = null;
        }
    }
    
    registerDevice () {
        var deviceID = app.state.deviceID;
        if (!!deviceID && deviceID !== undefined && deviceID !== 'undefined') {
            client.otalkRegister(deviceID).then(function () {
                client.registerPush('push@push.otalk.im/prod');
            }).catch(function (err) {
                console.log('Could not enable push notifications');
            });
        }
    }
    
    avatar: string = ""
    connected: boolean = false
    shouldAskForAlertsPermission: boolean = false
    hasFocus: boolean = false
    private _activeContact: string = ""
    stream: Object = null
    soundEnabled: boolean = true
    
    jid: {bare; local} = null
    status: string = ""
    avatarID: string = ""
    rosterVer: string = ""
    nick: string = ""
    
    contacts: Contacts
    contactsRequests: ContactRequests
    mucs: MUCs
    calls: Calls
    
    get displayName() {
        return this.nick || this.jid.bare;
    }
    
    get streamUrl() {
        if (!this.stream) return '';
        return URL.createObjectURL(this.stream);
    }
    
    get organization() {
        return app.serverConfig().name || 'Kaiwa';
    }
    
    get soundEnabledClass() {
        return this.soundEnabled ? "primary" : "secondary";
    }
    
    get isAdmin() {
        return this.jid.local === SERVER_CONFIG.admin ? 'meIsAdmin' : '';
    }
}