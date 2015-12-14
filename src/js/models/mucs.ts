/*global app, client*/
"use strict";

import App from './app'

declare const app: App

import Collection from './baseCollection'
import MUC from './muc'

export default class MUCs extends Collection<MUC> {
    comparator (model1, model2) {
        var name1 = model1.displayName.toLowerCase();
        var name2 = model2.displayName.toLowerCase();
        if (name1 === name2) {
            return 0;
        }
        if (name1 < name2) {
            return -1;
        }
        return 1;
    }
    
    fetch () {
        var self = this;
        app.whenConnected(function () {
            client.getBookmarks(function (err, res) {
                if (err) return;

                var mucs = res.privateStorage.bookmarks.conferences || [] as MUCs;
                mucs.forEach(function (muc: MUC) {
                    self.add(muc);
                    if (muc.autoJoin) {
                        self.get(muc.jid).join();
                    }
                });

                self.trigger('loaded');
            });
        });
    }
    
    save (cb) {
        var self = this;
        app.whenConnected(function () {
            var models = [];
            self.forEach(function (model) {
                models.push({
                    name: model.name,
                    jid: model.jid,
                    nick: model.nick,
                    autoJoin: model.autoJoin
                });
            });
            client.setBookmarks({conferences: models}, cb);
        });
    }
}