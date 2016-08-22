import * as async from 'async';
const bows = require('bows');
import * as _ from 'lodash';
import * as uuid from 'node-uuid';
const StanzaIo = require('stanza.io');

import App from '../models/App';
import Call  from '../models/call';
import Contact from '../models/contact';
import Me from '../models/Me';
import Message from '../models/message';
import Resource from '../models/resource';
import {LOCAL_STORAGE_KEY} from '../redux/Session';

const ioLogIn = bows('<< in');
const ioLogOut = bows('>> out');

interface IPresence {
    from: string;
    caps: {
        node: string;
        ver: string;
        hash: string;
    };
}

function createDiscoCapsQueue(app: App, me: Me, client: any) {
    return async.queue<IPresence>(function (pres, cb) {
        const jid = pres.from;
        const caps = pres.caps;

        console.info('Checking storage for ' + caps.ver);

        const contact = me.getContact(jid);
        let resource = null;
        if (contact) {
            resource = contact.resources.get(jid);
        }

        app.storage.disco.get(caps.ver, function (err, existing) {
            if (existing) {
                console.info('Already found info for ' + caps.ver);
                if (resource) resource.discoInfo = existing;
                return cb();
            }
            console.info('getting info for ' + caps.ver + ' from ' + jid);
            client.getDiscoInfo(jid, caps.node + '#' + caps.ver, function (err, result) {
                if (err || !result.discoInfo.features) {
                    console.info('Couldnt get info for ' + caps.ver);
                    return cb();
                }
                if (client.verifyVerString(result.discoInfo, caps.hash, caps.ver)) {
                    console.info('Saving info for ' + caps.ver);
                    const data = result.discoInfo;
                    app.storage.disco.add(caps.ver, data, function () {
                        if (resource) resource.discoInfo = data;
                        cb();
                    });
                } else {
                    console.info('Couldnt verify info for ' + caps.ver + ' from ' + jid);
                    cb();
                }
            });
        });
    });
}

export = function (client: any, app: App): void {
    const {api, me} = app;
    const discoCapsQueue = createDiscoCapsQueue(app, me, api);

    client.on('*', function (name, data) {
        if (name === 'raw:incoming') {
            ioLogIn.debug(data.toString());
        } else if (name === 'raw:outgoing') {
            ioLogOut.debug(data.toString());
        }
    });

    client.on('credentials:update', function (creds) {
        client.config.credentials = creds;
        if (!client.config.saveCredentials) {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            return;
        }

        if (KAIWA_CONFIG.securePasswordStorage) {
            if (creds.clientKey && creds.serverKey) {
                delete creds.password;
                delete creds.saltedPassword;
            } else if (creds.saltedPassword) {
                delete creds.password;
            }
        } else {
            creds = {
                password: creds.password
            };
        }

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
            jid: client.config.jid.bare,
            server: client.config.server,
            wsURL: client.config.wsURL,
            transports: client.config.transports,
            saveCredentials: client.config.saveCredentials,
            credentials: creds
        }));
    });

    client.on('disconnected', function (err) {
        app.state.connected = false;
        if (err) {
            console.error(err);
        }
        if (!app.state.hasConnected) {
            console.warn('Disconnected event received');
            window.location.href = 'login';
        }
    });

    client.on('auth:failed', function () {
        console.warn('Authentication failed');
        window.location.href = 'login';
    });

    client.on('stream:management:resumed', function () {
        app.state.connected = true;
    });

    client.on('session:started', function (jid) {
        me.updateJid(jid);

        app.state.connected = true;

        client.getRoster(function (err, resp) {
            if (resp.roster && resp.roster.items && resp.roster.items.length) {
                app.storage.roster.clear(function () {
                    me.contacts.reset();
                    me.rosterVer = resp.roster.ver;

                    _.each(resp.roster.items, function (item) {
                        me.setContact(item, true);
                    });
                });
            }

            const caps = client.updateCaps();
            app.storage.disco.add(caps.ver, caps.discoInfo, function () {
                client.sendPresence({
                    status: me.status,
                    caps: client.disco.caps
                });
                client.enableCarbons();
            });

            me.mucs.fetch();
        });

        const keepalive = KAIWA_CONFIG.keepalive;
        if (keepalive) {
            client.enableKeepAlive(keepalive);
        }
    });

    client.on('roster:update', function (iq) {
        const items = iq.roster.items;

        me.rosterVer = iq.roster.ver;

        _.each(items, function (item) {
            const contact = me.getContact(item.jid);

            if (item.subscription === 'remove') {
                if (contact) {
                    me.removeContact(item.jid);
                }
                return;
            }

            me.setContact(item, true);
        });
    });

    client.on('subscribe', function (pres) {
        me.contactRequests.add({
            jid: pres.from.bare
        });
    });

    client.on('available', function (pres) {
        const contact = me.getContact(pres.from);
        if (contact) {
            delete pres.id;
            pres.show = pres.show || '';
            pres.status = pres.status || '';
            pres.priority = pres.priority || 0;

            let resource = contact.resources.get(pres.from);
            if (resource) {
                pres.from = pres.from.full;
                // Explicitly set idleSince to null to clear
                // the model's value.
                if (!pres.idleSince) {
                    pres.idleSince = null;
                }
                resource.set(pres);
            } else {
                resource = new Resource(pres);
                resource.id = pres.from.full;
                contact.resources.add(resource);

                if (!pres.caps) {
                    resource.fetchDisco();
                }
                resource.fetchTimezone();
            }

            const muc = pres.muc || {};
            if (muc.codes && muc.codes.indexOf('110') >= 0) {
                contact.joined = true;
            }
        }
    });

    client.on('unavailable', function (pres) {
        const contact = me.getContact(pres.from);
        if (contact) {
            const resource = contact.resources.get(pres.from.full);
            if (resource) {
                if (resource.id === contact.lockedResource) {
                    contact.lockedResource = '';
                }

                if (contact.resources.length === 1) {
                    contact.offlineStatus = pres.status;
                }
                contact.resources.remove(resource);
            }

            const muc = pres.muc || {};
            if (muc.codes && muc.codes.indexOf('110') >= 0) {
                contact.joined = false;
            }
        }
    });

    client.on('avatar', function (info) {
        let contact = me.getContact(info.jid);
        if (!contact) {
            if (me.isMe(info.jid)) {
                contact = me;
            } else {
                return;
            }
        }

        let id = '';
        let type = 'image/png';
        if (info.avatars.length > 0) {
            id = info.avatars[0].id;
            type = info.avatars[0].type || 'image/png';
        }

        if (contact.type === 'muc') {
            const resource = contact.resources.get(info.jid.full);
            if (resource) {
                resource.setAvatar(id, type, info.source);
            }
        }

        if (contact.setAvatar) {
            contact.setAvatar(id, type, info.source);
        }
    });

    client.on('chatState', function (info) {
        let contact = me.getContact(info.from);
        if (contact) {
            const resource = contact.resources.get(info.from.full);
            if (resource) {
                resource.chatState = info.chatState;
                if (info.chatState === 'gone') {
                    contact.lockedResource = undefined;
                } else {
                    contact.lockedResource = info.from.full;
                }
            }
        } else if (me.isMe(info.from)) {
            if (info.chatState === 'active' || info.chatState === 'composing') {
                contact = me.getContact(info.to);
                if (contact) {
                    contact.unreadCount = 0;
                }
            }
        }
    });

    client.on('chat', function (msg) {
        msg.mid = msg.id;
        delete msg.id;

        const contact = me.getContact(msg.from, msg.to);
        if (contact && !msg.replace) {
            const message = new Message(msg);

            if (msg.archived) {
                msg.archived.forEach(function (archived) {
                    if (me.isMe(archived.by)) {
                        message.archivedId = archived.id;
                    }
                });
            }

            if (msg.carbon)
                msg.delay.stamp = new Date(Date.now() + app.timeInterval);

            message.acked = true;
            const localTime = new Date(Date.now() + app.timeInterval).getTime();
            const notify = Math.round((localTime - message.created) / 1000) < 5;
            contact.addMessage(message, notify);
            if (msg.from.bare === contact.jid.bare) {
                contact.lockedResource = msg.from.full;
            }
        }
    });

    client.on('groupchat', function (msg) {
        msg.mid = msg.id;
        delete msg.id;

        const contact = me.getContact(msg.from, msg.to);
        if (contact && !msg.replace) {
            const message = new Message(msg);
            message.acked = true;
            const localTime = new Date(Date.now() + app.timeInterval).getTime();
            const notify = Math.round((localTime - message.created) / 1000) < 5;
            contact.addMessage(message, notify);
        }
    });

    client.on('muc:subject', function (msg) {
        const contact = me.getContact(msg.from, msg.to);
        if (contact) {
            contact.subject = msg.subject === 'true' ? '' : msg.subject;
        }
    });

    client.on('replace', function (msg) {
        msg.mid = msg.id;
        delete msg.id;

        const contact = me.getContact(msg.from, msg.to);
        if (!contact) return;

        const original = Message.idLookup(msg.from[msg.type === 'groupchat' ? 'full' : 'bare'], msg.replace);

        if (!original) return;

        original.correct(msg);
    });

    client.on('receipt', function (msg) {
        const contact = me.getContact(msg.from, msg.to);
        if (!contact) return;

        const original = Message.idLookup(msg.to[msg.type === 'groupchat' ? 'full' : 'bare'], msg.receipt);

        if (!original) return;

        original.receiptReceived = true;
    });

    client.on('message:sent', function (msg) {
        if (msg.carbon) {
            msg.delay.stamp = new Date(Date.now() + app.timeInterval);

            client.emit('message', msg);
        }
    });

    client.on('disco:caps', function (pres) {
        if (pres.caps.hash) {
            console.info('Caps from ' + pres.from + ' ver: ' + pres.caps.ver);
            discoCapsQueue.push(pres);
        }
    });

    client.on('stanza:acked', function (stanza) {
        if (stanza.body) {
            const contact = me.getContact(stanza.to, stanza.from);
            if (contact) {
                const msg = Message.idLookup(me.jid.bare, stanza.id);
                if (msg) {
                    msg.acked = true;
                }
            }
        }
    });

    client.on('jingle:incoming', function (session) {
        let contact = me.getContact(session.peer);
        if (!contact) {
            contact = new Contact({ jid: new StanzaIo.JID(session.peer).bare });
            contact.resources.add({id: session.peer});
            me.contacts.add(contact);
        }

        const call = new Call({
            contact: contact,
            state: 'incoming',
            jingleSession: session
        });
        contact.jingleCall = call;
        contact.callState = 'incoming';
        me.calls.add(call);
        // FIXME: send directed presence if not on roster
    });

    client.on('jingle:outgoing', function (session) {
        const contact = me.getContact(session.peer);
        const call = new Call({
            contact: contact,
            state: 'outgoing',
            jingleSession: session
        });
        contact.jingleCall = call;
        me.calls.add(call);
    });

    client.on('jingle:terminated', function (session) {
        const contact = me.getContact(session.peer);
        contact.callState = '';
        contact.jingleCall = null;
        contact.onCall = false;
        if (me.calls.length === 1) { // this is the last call
            client.jingle.stopLocalMedia();
            client.jingle.localStream = null;
        }
    });

    client.on('jingle:accepted', function (session) {
        const contact = me.getContact(session.peer);
        contact.callState = 'activeCall';
        contact.onCall = true;
    });

    client.on('jingle:localstream:added', function (stream) {
        me.stream = stream;
    });

    client.on('jingle:localstream:removed', function () {
        me.stream = null;
    });

    client.on('jingle:remotestream:added', function (session) {
        const contact = me.getContact(session.peer);
        if (!contact) {
            contact.resources.add({id: session.peer});
            me.contacts.add(contact);
        }
        contact.stream = session.streams[0];
    });

    client.on('jingle:remotestream:removed', function (session) {
        const contact = me.getContact(session.peer);
        contact.stream = null;
    });

    client.on('jingle:ringing', function (session) {
        const contact = me.getContact(session.peer);
        contact.callState = 'ringing';
    });
};
