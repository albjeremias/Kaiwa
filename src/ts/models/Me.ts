const crypto = require('crypto');
const getUserMedia = require('getusermedia');
const StanzaIo = require('stanza.io');

const fetchAvatar = require('../../js/helpers/fetchAvatar');
const Resample = require('../../js/libraries/resampler');
import App from './App';
import Collection from './Collection';
import Contacts from './contacts';
import Calls from './calls';
import Contact from './contact';
import MUCs from './mucs';
import ContactRequests from './contactRequests';

declare const app: App;
declare const client: any;

export default class Me {
    show: () => void;
    contactRequests = new Collection<any>();

    constructor(public calls: Calls, opts: { avatarID?: string }) {
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
        this.mucs.bind('change:unreadHlCount', this.updateUnreadCount, this);
        app.state.bind('change:active', this.updateIdlePresence, this);
        app.state.bind('change:deviceIDReady', this.registerDevice, this);
    }

    setActiveContact (jid) {
        const prev = this.getContact(this._activeContact);
        if (prev) {
            prev.activeContact = false;
        }
        const curr = this.getContact(jid);
        if (curr) {
            curr.activeContact = true;
            curr.unreadCount = 0;
            if ('unreadHlCount' in curr)
                curr.unreadHlCount = 0;
            this._activeContact = curr.id;
        }
    }

    getName () {
        return this.displayName;
    }

    getNickname () {
        return this.displayName !== this.nick ? this.nick : '';
    }

    getAvatar () {
        return this.avatar;
    }

    setAvatar (id, type?, source?) {
        const self = this;
        fetchAvatar('', id, type, source, function (avatar) {
            self.avatarID = avatar.id;
            self.avatar = avatar.uri;
        });
    }

    publishAvatar (data?: string) {
        if (!data) data = this.avatar;
        if (!data || data.indexOf('https://') !== -1) return;

        const resampler = new Resample(data, 80, 80, function (data) {
            const b64Data = data.split(',')[1];
            const id = crypto.createHash('sha1').update(atob(b64Data)).digest('hex');
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

    getContact (jid, alt?: string): any {
        if (typeof jid === 'string') {
            if (KAIWA_CONFIG.domain && jid.indexOf('@') === -1) jid += '@' + KAIWA_CONFIG.domain;
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
        let contact = this.getContact(data.jid);
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
        const self = this;
        client.removeRosterItem(jid, function(err, res) {
            const contact = self.getContact(jid);
            self.contacts.remove(contact.jid);
            app.storage.roster.remove(contact.storageId);
        });
    }

    load () {
        if (!this.jid.bare) return;

        const self = this;

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
                    if (contact.jid.indexOf('@' + KAIWA_CONFIG.domain) > -1)
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
        const update = {
            status: this.status,
            show: this.show,
            caps: app.api.disco.caps
        };

        if (!app.state.active) {
            update['idle'] = {since: app.state.idleSince};
        }

        app.api.sendPresence(update);
    }

    updateUnreadCount() {
        const sum = function (a, b) {
            return a + b;
        };

        let pmCount = this.contacts.pluck('unreadCount')
            .reduce(sum);
        pmCount = pmCount ? pmCount + ' • ' : '';

        let hlCount = this.mucs.pluck('unreadHlCount')
            .reduce(sum);
        hlCount = hlCount ? 'H' + hlCount + ' • ' : '';

        app.state.badge = pmCount + hlCount;
    }

    updateActiveCalls () {
        app.state.hasActiveCall = !!this.calls.length;
    }

    save () {
        const data = {
            jid: this.jid.bare,
            avatarID: this.avatarID,
            status: this.status,
            rosterVer: this.rosterVer,
            soundEnabled: this.soundEnabled
        };
        app.storage.profiles.set(data);
    }

    cameraOn () {
        const self = this;
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
        const deviceID = app.state.deviceID;
        if (!!deviceID && deviceID !== undefined && deviceID !== 'undefined') {
            client.otalkRegister(deviceID).then(function () {
                client.registerPush('push@push.otalk.im/prod');
            }).catch(function (err) {
                console.log('Could not enable push notifications');
            });
        }
    }

    avatar: string = '';
    connected: boolean = false;
    shouldAskForAlertsPermission: boolean = false;
    hasFocus: boolean = false;
    private _activeContact: string = '';
    stream: any = null;
    soundEnabled: boolean = true;

    jid: any = null;
    status: string = '';
    avatarID: string = '';
    rosterVer: string = '';
    nick: string = '';

    contacts = new Contacts();
    contactsRequests: ContactRequests;
    mucs: MUCs;

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
        return this.soundEnabled ? 'primary' : 'secondary';
    }

    get isAdmin() {
        return this.jid.local === KAIWA_CONFIG.admin ? 'meIsAdmin' : '';
    }

    private bind(event: string, handler: () => void, instance: Me) {
        console.warn(`TODO: Binding event ${event} on Me object`);
        // TOOD: Really this method should never be called. ~ F
    }
}
