import App from './App';
import Me from './me';

declare const app: App;
declare const me: Me;
declare const templates: any;

const _ = require('underscore');
const uuid = require('node-uuid');
const htmlify = require('../../js/helpers/htmlify');

const ID_CACHE = {};

export default class Message {
    constructor(attrs) {
        this._created = new Date(Date.now() + app.timeInterval);
    }

    set (attrs: any) {
        for (const key of attrs) {
            (this as any)[key] = attrs[key];
        }
    }

    correct (msg) {
        if (this.from.full !== msg.from.full) return false;

        delete msg.id;

        this.set(msg);
        this._edited = new Date(Date.now() + app.timeInterval);
        this.edited = true;

        this.save();

        return true;
    }

    bareMessageTemplate (firstEl) {
        if (this.type === 'groupchat') {
            return templates.includes.mucBareMessage({message: this, messageDate: new Date(this.timestamp), firstEl: firstEl});
        } else {
            return templates.includes.bareMessage({message: this, messageDate: new Date(this.timestamp), firstEl: firstEl});
        }
    }

    save () {
        if (this.mid) {
            const from = this.type === 'groupchat' ? this.from.full : this.from.bare;
            Message.idStore(from, this.mid, this);
        }

        const data = {
            archivedId: this.archivedId || uuid.v4(),
            owner: this.owner,
            to: this.to,
            from: this.from,
            created: this.created,
            body: this.body,
            type: this.type,
            delay: this.delay,
            edited: this.edited
        };
        app.storage.archive.add(data);
    }

    shouldGroupWith (previous) {
        if (this.type === 'groupchat') {
            return previous && previous.from.full === this.from.full && Math.round((this.created - previous.created) / 1000) <= 300 && previous.created.toLocaleDateString() === this.created.toLocaleDateString();
        } else {
            return previous && previous.from.bare === this.from.bare && Math.round((this.created - previous.created) / 1000) <= 300 && previous.created.toLocaleDateString() === this.created.toLocaleDateString();
        }
    }

    private _created: Date = null;
    private _edited: Date = null;
    private _mucMine: boolean = false;
    receiptReceived: boolean = false;
    edited: boolean = false;
    delay: {stamp} = null;
    mentions: any[] = [];

    mid: string = '';
    owner: string = '';
    to: Object = null;
    from: {full; bare; resource} = null;
    body: string = '';
    type: string = '';
    acked: boolean = false;
    requestReceipt: boolean = false;
    receipt: boolean = false;
    archivedId: string = '';
    oobURIs: any[] = [];

    get mine() {
        return this._mucMine || me.isMe(this.from);
    }

    get sender(): any {
        if (this.mine) {
            return me;
        } else {
            return me.getContact(this.from);
        }
    }

    get delayed() {
        return !!this.delay;
    }

    get created() {
        if (this.delay && this.delay.stamp) {
            return this.delay.stamp;
        }
        return this._created;
    }

    get timestamp() {
        if (this._edited && !isNaN(this._edited.valueOf())) {
            return this._edited;
        }
        return this.created;
    }

    get formattedTime() {
        if (this.created) {
            const month = this.created.getMonth() + 1;
            const day = this.created.getDate();
            const hour = this.created.getHours();
            const minutes = this.created.getMinutes();

            const m = (hour >= 12) ? 'p' : 'a';
            const strDay = (day < 10) ? '0' + day : day;
            const strHour = (hour < 10) ? '0' + hour : hour;
            const strMin = (minutes < 10) ? '0' + minutes : minutes;

            return '' + month + '/' + strDay + ' ' + strHour + ':' + strMin + m;
        }
        return undefined;
    }

    get pending() {
        return !this.acked;
    }

    get nick() {
        if (this.type === 'groupchat') {
            return this.from.resource;
        }
        if (this.mine) {
            return 'me';
        }
        return me.getContact(this.from.bare).displayName;
    }

    get processedBody() {
        let body = this.body;
        if (this.meAction) {
            body = body.substr(4);
        }
        body = htmlify.toHTML(body);
        for (let i = 0; i < this.mentions.length; i++) {
            const existing = htmlify.toHTML(this.mentions[i]);
            const parts = body.split(existing);
            body = parts.join('<span class="mention">' + existing + '</span>');
        }
        return body;
    }

    get partialTemplateHtml() {
        return this.bareMessageTemplate(false);
    }

    get templateHtml() {
        if (this.type === 'groupchat') {
            return templates.includes.mucWrappedMessage({message: this, messageDate: new Date(this.timestamp), firstEl: true});
        } else {
            return templates.includes.wrappedMessage({message: this, messageDate: new Date(this.timestamp), firstEl: true});
        }
    }

    get classList() {
        const res = [];

        if (this.mine) res.push('mine');
        if (this.pending) res.push('pending');
        if (this.delayed) res.push('delayed');
        if (this.edited) res.push('edited');
        if (this.requestReceipt) res.push('pendingReceipt');
        if (this.receiptReceived) res.push('delivered');
        if (this.meAction) res.push('meAction');

        return res.join(' ');
    }

    get meAction() {
        return this.body.indexOf('/me') === 0;
    }

    get urls() {
        const self = this;
        const result = [];
        const urls = htmlify.collectLinks(this.body);
        const oobURIs = _.pluck(this.oobURIs || [], 'url');
        const uniqueURIs = _.unique(result.concat(urls).concat(oobURIs));

        _.each(uniqueURIs, function (url) {
            const oidx = oobURIs.indexOf(url);
            if (oidx >= 0) {
                result.push({
                    href: url,
                    desc: self.oobURIs[oidx].desc,
                    source: 'oob'
                });
            } else {
                result.push({
                    href: url,
                    desc: url,
                    source: 'body'
                });
            }
        });

        return result;
    }

    static idLookup(jid, mid) {
        const cache = ID_CACHE[jid] || (ID_CACHE[jid] = {});
        return cache[mid];
    }

    static idStore(jid, mid, msg) {
        const cache = ID_CACHE[jid] || (ID_CACHE[jid] = {});
        cache[mid] = msg;
    }
}
