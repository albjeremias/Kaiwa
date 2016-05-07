/*global app, me, client, URL*/
"use strict";

var _ = require('underscore');
var crypto = require('crypto');
var async = require('async');
var uuid = require('node-uuid');
const logger = require('andlog');

const fetchAvatar = require('../helpers/fetchAvatar');

import App from './app'
import Me from './me'

import Resources from './resources'
import Resource from './resource'

import Message from './message'
import Messages from './messages'

declare const app: App
declare const me: Me

export default class Contact {
    constructor(attrs) {
        if (attrs.jid) {
            this.id = attrs.jid;
        }
        this.setAvatar(attrs.avatarID);

        this.resources.bind('add remove reset', this.onResourceListChange, this);
        this.resources.bind('change', this.onResourceChange, this);

        this.bind('change:topResource change:lockedResource change:_forceUpdate', this.summarizeResources, this);

        this.fetchHistory(true);

        var self = this;
        client.on('session:started', function () {
            if (self.messages.length)
                self.fetchHistory(true, true);
        });
    }
    
    call () {
        if (this.jingleResources.length) {
            var peer = this.jingleResources[0];
            this.callState = 'starting';
            app.api.call(peer.id);
        } else {
            logger.error('no jingle resources for this user');
        }
    }
    
    setAvatar (id, type?, source?) {
        var self = this;
        fetchAvatar(this.jid, id, type, source, function (avatar) {
            if (source == 'vcard' && self.avatarSource == 'pubsub') return;
            self.avatarID = avatar.id;
            self.avatar = avatar.uri;
            self.avatarSource = source;
            self.save();
        });
    }
    
    onResourceChange () {
        this.resources.sort();
        this.topResource = (this.resources.first() || {} as Resource).id;
        this._forceUpdate++;
    }
    
    onResourceListChange () {
        // Manually propagate change events for properties that
        // depend on the resources collection.
        this.resources.sort();

        var res = this.resources.first();
        if (res) {
            this.offlineStatus = '';
            this.topResource = res.id;
        } else {
            this.topResource = undefined;
        }

        this.lockedResource = undefined;
    }
    
    addMessage (message, notify) {
        message.owner = me.jid.bare;

        if (notify && (!this.activeContact || (this.activeContact && !app.state.focused)) && message.from.bare === this.jid) {
            this.unreadCount++;
            app.notifications.create(this.displayName, {
                body: message.body,
                icon: this.avatar,
                tag: this.jid,
                onclick: _.bind(app.navigate, app, '/chat/' + encodeURIComponent(this.jid))
            });
            if (me.soundEnabled)
                app.soundManager.play('ding');
        }

        var existing = Message.idLookup(message.from[message.type == 'groupchat' ? 'full' : 'bare'], message.mid);
        if (existing) {
            existing.set(message);
            existing.save();
        } else {
            this.messages.push(message);
            message.save();
        }

        var newInteraction = new Date(message.created);
        if (!this.lastInteraction || this.lastInteraction < newInteraction) {
            this.lastInteraction = newInteraction;
        }
    }
    
    fetchHistory (onlyLastMessages, allInterval?) {
        var self = this;
        app.whenConnected(function () {
            var filter = {
                'with': self.jid,
                rsm: {
                    max: !!onlyLastMessages && !allInterval ? 50 : 40
                }
            };

            if (!!onlyLastMessages) {
                var lastMessage = self.messages.last();
                if (lastMessage && lastMessage.archivedId) {
                    filter.rsm.after = lastMessage.archivedId;
                }
                if (!allInterval) {
                    filter.rsm.before = true;

                    if (self.lastHistoryFetch && !isNaN(self.lastHistoryFetch.valueOf())) {
                        if (self.lastInteraction > self.lastHistoryFetch) {
                            filter.start = self.lastInteraction;
                        } else {
                            filter.start = self.lastHistoryFetch;
                        }
                    } else {
                        filter.end = new Date(Date.now() + app.timeInterval);
                    }
                }
            } else {
                var firstMessage = self.messages.first();
                if (firstMessage && firstMessage.archivedId) {
                    filter.rsm.before = firstMessage.archivedId;
                }
            }

            client.searchHistory(filter, function (err, res) {
                if (err) return;

                self.lastHistoryFetch = new Date(Date.now() + app.timeInterval);

                var results = res.mamResult.items || [];
                if (!!onlyLastMessages && !allInterval) results.reverse();
                results.forEach(function (result) {
                    var msg = result.forwarded.message;

                    msg.mid = msg.id;
                    delete msg.id;

                    if (!msg.delay) {
                        msg.delay = result.forwarded.delay;
                    }

                    if (msg.replace) {
                        var original = Message.idLookup(msg.from[msg.type == 'groupchat' ? 'full' : 'bare'], msg.replace);
                        // Drop the message if editing a previous, but
                        // keep it if it didn't actually change an
                        // existing message.
                        if (original && original.correct(msg)) return;
                    }

                    var message = new Message(msg);
                    message.archivedId = result.id;
                    message.acked = true;

                    self.addMessage(message, false);
                });

                if (allInterval) {
                    if (results.length == 40) {
                        self.fetchHistory(true, true);
                    } else {
                        self.trigger('refresh');
                    }
                }
            });
        });
    }
    
    save () {
        if (!this.inRoster) return;

        var storageId = crypto.createHash('sha1').update(this.owner + '/' + this.id).digest('hex');
        var data = {
            storageId: storageId,
            owner: this.owner,
            jid: this.jid,
            name: this.name,
            groups: this.groups,
            subscription: this.subscription,
            avatarID: this.avatarID
        };
        app.storage.roster.add(data);
    }
    
    activeContact: boolean = false
    avatar: string = ""
    avatarSource: string = ""
    lastInteraction: Date = null
    lastHistoryFetch: Date = null
    lastSentMessage: Object = null
    lockedResource: string = ""
    offlineStatus: string = ""
    topResource: string = ""
    unreadCount: number = 0
    private _forceUpdate: number = 0
    onCall: boolean = false
    persistent: boolean = false
    stream: Object = null
    
    id: string = ""
    avatarID: string = ""
    groups: any[] = []
    inRoster: boolean = false
    jid: string = ""
    name: string = ""
    owner: string = ""
    storageId: string = ""
    subscription: string = ""
    callState: string = ""
    
    resources: Resources
    messages: Messages
    
    get streamUrl() { 
        if (!this.stream) return ''
        return URL.createObjectURL(this.stream)
    }
    
    get displayName() {
        return this.name || this.jid
    }
    
    get displayUnreadCount() {
        if (this.unreadCount > 0) return this.unreadCount.toString();
        return '';
    }
    
    get formattedTZO() {
        if (!this.timezoneOffset) return '';

        var localTime = new Date();
        var localTZO = localTime.getTimezoneOffset();
        var diff = Math.abs(localTZO  % (24 * 60) - this.timezoneOffset % (24 * 60));
        var remoteTime = new Date(Date.now() + diff * 60000);


        var day = remoteTime.getDate();
        var hour = remoteTime.getHours();
        var minutes = remoteTime.getMinutes();

        var days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

        var dow = days[remoteTime.getDay()];
        var localDow = days[localTime.getDay()];

        var m = (hour >= 12) ? ' PM' : ' AM';

        hour = hour % 12;
        if (hour === 0) {
            hour = 12;
        }

        var strDay = (day < 10) ? '0' + day : day;
        var strHour = (hour < 10) ? '0' + hour : hour;
        var strMin = (minutes < 10) ? '0' + minutes: minutes;

        if (localDow == dow) {
            return strHour + ':' + strMin + m;
        } else {
            return dow + ' ' + strHour + ':' + strMin + m;
        }
    }
    
    get status() {
        var resource: Resource = this.resources.get(this.lockedResource) || this.resources.get(this.topResource) || {} as Resource;
        return resource.status || '';
    }
    
    get show() {
        if (this.resources.length === 0) {
            return 'offline';
        }
        var resource = this.resources.get(this.lockedResource) || this.resources.get(this.topResource) || {} as Resource;
        return resource.show || 'online';
    }
    
    get timezoneOffset() {
        var resource = this.resources.get(this.lockedResource) || this.resources.get(this.topResource) || {} as Resource;
        return resource.timezoneOffset || undefined;
    }
    
    get idleSince() {
        var resource = this.resources.get(this.lockedResource) || this.resources.get(this.topResource) || {} as Resource;
        return resource.idleSince || undefined;
    }
    
    get idle() {
        return this.idleSince && !isNaN(this.idleSince.valueOf());
    }
    
    get chatState() {
        var states: any = {};
        this.resources.forEach(function (resource) {
            states[resource.chatState] = true;
        });

        if (states.composing) return 'composing';
        if (states.paused) return 'paused';
        if (states.active) return 'active';
        if (states.inactive) return 'inactive';
        return 'gone';
    }
    
    get chatStateText() {
        var chatState = this.chatState;
        if (chatState == 'composing')
            return this.displayName + ' is composing';
        else if (chatState == 'paused')
            return this.displayName + ' stopped writing';
        else if (chatState == 'gone')
            return this.displayName + ' is gone';
        return '';
    }
    
    get supportsReceipts() {
        if (!this.lockedResource) return false;
        var res = this.resources.get(this.lockedResource);
        return res.supportsReceipts;
    }
    
    get supportsChatStates() {
        if (!this.lockedResource) return false;
        var res = this.resources.get(this.lockedResource);
        return res && res.supportsChatStates;
    }
    
    get hasUnread() {
        return this.unreadCount > 0;
    }
    
    get jingleResources() {
        return this.resources.filter(function (res) {
            return res.supportsJingleMedia;
        });
    }
    
    get callable() {
        return !!this.jingleResources.length;
    }
    
    get callObject() {
        return app.calls.where('contact', this);
    }
}