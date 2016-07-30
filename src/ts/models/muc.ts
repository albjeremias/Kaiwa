import App from './App';
import Me from './me';

declare const app: App;
declare const me: Me;
declare const client: any;

const async = require('async');
const uuid = require('node-uuid');
const htmlify = require('../helpers/htmlify');
const fetchAvatar = require('../helpers/fetchAvatar');

import Resources from './resources';
import Messages from './messages';
import Message from './message';

export default class MUC {
    avatar: any;
    trigger: (event: string) => void;

    constructor(attrs) {
        if (attrs.jid) {
            this.id = attrs.jid.full;
        }
        const self = this;
        this.resources.bind('add remove reset', function(){
            self.membersCount = self.resources.length;
        });
    }

    getName (jid) {
        const nickname = jid.split('/')[1];
        let name = nickname;
        const xmppContact = me.getContact(nickname) as any;
        if (xmppContact) {
            name = xmppContact.displayName;
        }
        return name !== '' ? name : nickname;
    }

    getNickname (jid) {
        const nickname = jid.split('/')[1];
        return nickname !== this.getName(jid) ? nickname : '';
    }

    getAvatar (jid) {
        const resource = this.resources.get(jid);
        if (resource && resource.avatar) {
            return resource.avatar;
        }
        return 'https://www.gravatar.com/avatar/00000000000000000000000000000000?s=80&d=mm';
    }

    addMessage (message, notify) {
        message.owner = me.jid.bare;

        const self = this;

        const mentions = [];
        let toMe = false;
        if (message.body.toLowerCase().indexOf(self.nick) >= 0) {
            mentions.push(self.nick);
            toMe = true;
        }
        if (message.body.toLowerCase().indexOf('all: ') >= 0) {
            mentions.push('all:');
        }
        message.mentions = mentions;

        const mine = message.from.resource === this.nick;

        if (mine) {
            message._mucMine = true;
        }

        if (notify && (!this.activeContact || (this.activeContact && !app.state.focused)) && !mine) {
            this.unreadCount++;
            if (toMe) {
                app.notifications.create(this.displayName, {
                    body: message.body,
                    icon: this.avatar,
                    tag: this.id,
                    onclick: _.bind(app.navigate, app, '/groupchat/' + encodeURIComponent(this.jid.jid))
                });
                if (me.soundEnabled)
                    app.soundManager.play('threetone-alert');
            } else {
                if (me.soundEnabled)
                    app.soundManager.play('ding');
            }
        }

        message.acked = true;

        if (mine) {
            this.lastSentMessage = message;
        }

        const existing = Message.idLookup(message.from['full'], message.mid);
        if (existing) {
            existing.set(message);
            existing.save();
        } else {
            this.messages.add(message);
            message.save();
        }

        const newInteraction = new Date(message.created);
        if (!this.lastInteraction || this.lastInteraction < newInteraction) {
            this.lastInteraction = newInteraction;
        }
    }

    join (manual?: boolean) {
        if (!this.nick) {
            this.nick = me.jid.local;
        }
        this.messages.reset();
        this.resources.reset();

        client.joinRoom(this.jid, this.nick, {
            joinMuc: {
                history: {
                    maxstanzas: 50
                }
            }
        });

        if (manual) {
            const form = {
                fields: [
                    {
                      type: 'hidden',
                      name: 'FORM_TYPE',
                      value: 'http://jabber.org/protocol/muc#roomconfig'
                    },
                    {
                      type: 'boolean',
                      name: 'muc#roomconfig_changesubject',
                      value: true
                    },
                    {
                      type: 'boolean',
                      name: 'muc#roomconfig_persistentroom',
                      value: true
                    },
                ]
            };
            client.configureRoom(this.jid, form, function(err, resp) {
                if (err) return;
            });

            if (KAIWA_CONFIG.domain && KAIWA_CONFIG.admin) {
                const self = this;
                client.setRoomAffiliation(this.jid, KAIWA_CONFIG.admin + '@' + KAIWA_CONFIG.domain, 'owner', 'administration', function(err, resp) {
                    if (err) return;
                    client.setRoomAffiliation(self.jid, me.jid, 'none', 'administration');
                });
            }
        }

        const self = this;
        // After a reconnection
        client.on('muc:join', function (pres) {
            if (self.messages.length) {
                self.fetchHistory(true);
            }
        });
    }

    fetchHistory(allInterval) {
        const self = this;
        app.whenConnected(function () {
            const filter: any = {
                'to': self.jid,
                rsm: {
                    max: 40,
                    before: !allInterval
                }
            };

            if (allInterval) {
                const lastMessage = self.messages.last();
                if (lastMessage && lastMessage.created) {
                    const start = new Date(lastMessage.created);
                    filter.start = start.toISOString();
                }
            } else {
                const firstMessage = self.messages.first();
                if (firstMessage && firstMessage.created) {
                    const end = new Date(firstMessage.created);
                    filter.end = end.toISOString();
                }
            }

            client.searchHistory(filter, function (err, res) {
                if (err) return;

                const results = res.mamResult.items || [];

                results.forEach(function (result) {
                    const msg = result.forwarded.message;

                    msg.mid = msg.id;
                    delete msg.id;

                    if (!msg.delay) {
                        msg.delay = result.forwarded.delay;
                    }

                    if (msg.replace) {
                        const original = Message.idLookup(msg.from[msg.type === 'groupchat' ? 'full' : 'bare'], msg.replace);
                        // Drop the message if editing a previous, but
                        // keep it if it didn't actually change an
                        // existing message.
                        if (original && original.correct(msg)) return;
                    }

                    const message = new Message(msg);
                    message.archivedId = result.id;
                    message.acked = true;

                    self.addMessage(message, false);
                });

                if (allInterval) {
                  self.trigger('refresh');
                  if (results.length === 40)
                      self.fetchHistory(true);
                }
            });
        });
    }

    leave () {
        this.resources.reset();
        client.leaveRoom(this.jid, this.nick);
    }

    subject: string = '';
    activeContact: boolean = false;
    lastInteraction: Date = null;
    lastSentMessage: Object = null;
    unreadCount: number = 0;
    persistent: boolean = false;
    joined: boolean = false;
    membersCount: number = 0;

    id: string = '';
    name: string = '';
    autoJoin: boolean = false;
    nick: string = '';
    jid: {jid} = null;

    get displayName() {
        let disp = this.name;
        if (!disp) disp = this.jid.jid;
        return disp.split('@')[0];
    }

    get displayUnreadCount() {
        if (this.unreadCount > 0) {
            if (this.unreadCount < 100)
                return this.unreadCount.toString();
            else
                return '99+';
        }
        return '';
    }

    get displaySubject() {
        return htmlify.toHTML(this.subject);
    }

    get hasUnread() {
        return this.unreadCount > 0;
    }

    resources: Resources;
    messages: Messages;
}
