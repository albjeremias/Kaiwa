const fetchAvatar = require('../helpers/fetchAvatar');

import App from './app';

declare const app: App;

export default class Resource {
    constructor (values: { id: string }) {
        this.id = values.id;
    }

    fetchTimezone () {
        const self = this;

        if (self.timezoneOffset) return;

        app.whenConnected(function () {
            client.getTime(self.id, function (err, res) {
                if (err) return;
                self.timezoneOffset = res.time.tzo;
            });
        });
    }

    fetchDisco () {
        const self = this;

        if (self.discoInfo) return;

        app.whenConnected(function () {
            client.getDiscoInfo(self.id, '', function (err, res) {
                if (err) return;
                self.discoInfo = res.discoInfo;
            });
        });
    }

    setAvatar (id, type, source) {
        const self = this;
        fetchAvatar(this.id, id, type, source, function (avatar) {
            if (source === 'vcard' && self.avatarSource === 'pubsub') return;
            self.avatarID = avatar.id;
            self.avatar = avatar.uri;
            self.avatarSource = source;
        });
    }

    id: string = '';
    status: string = '';
    show: string = '';
    priority: number = 0;
    chatState: string = 'gone';
    idleSince: Date = null;
    discoInfo: {features} = null;
    timezoneOffset: number = 0;
    avatar: string = '';
    avatarSource: string = '';

    avatarID: string = '';

    get mucDisplayName() {
        return this.id.split('/')[1] || '';
    }

    get idle() {
        return this.idleSince && !isNaN(this.idleSince.valueOf());
    }

    get supportsReceipts() {
        if (!this.discoInfo) return false;
        const features = this.discoInfo.features || [];
        return features.indexOf('urn:xmpp:receipts') >= 0;
    }

    get supportsChatStates() {
        if (!this.discoInfo) return false;
        const features = this.discoInfo.features || [];
        return features.indexOf('http://jabber.org/protocol/chatstate') >= 0;
    }

    get supportsJingleMedia() {
        if (!this.discoInfo) return false;
        const features = this.discoInfo.features || [];
        if (features.indexOf('urn:xmpp:jingle:1') === -1) {
            return false;
        }

        if (features.indexOf('urn:xmpp:jingle:apps:rtp:1') === -1) {
            return false;
        }

        if (features.indexOf('urn:xmpp:jingle:apps:rtp:audio') === -1) {
            return false;
        }

        if (features.indexOf('urn:xmpp:jingle:apps:rtp:video') === -1) {
            return false;
        }

        return true;
    }

    get supportsJingleFiletransfer() {
        if (!this.discoInfo) return false;
        const features = this.discoInfo.features || [];
        if (features.indexOf('urn:xmpp:jingle:1') === -1) {
            return false;
        }

        if (features.indexOf('urn:xmpp:jingle:apps:file-transfer:3') === -1) {
            return false;
        }

        if (features.indexOf('urn:xmpp:jingle:transports:ice-udp:1') === -1) {
            return false;
        }

        if (features.indexOf('urn:xmpp:jingle:transports:dtls-sctp:1') === -1) {
            return false;
        }

        return true;
    }
}
