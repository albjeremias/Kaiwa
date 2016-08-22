import App from './App';

declare const app: App;
declare const client: any;

import Collection from './Collection';
import MUC from './muc';

export default class MUCs extends Collection<MUC> {
    comparator (model1, model2) {
        const name1 = model1.displayName.toLowerCase();
        const name2 = model2.displayName.toLowerCase();
        if (name1 === name2) {
            return 0;
        }
        if (name1 < name2) {
            return -1;
        }
        return 1;
    }

    fetch () {
        const self = this;
        app.whenConnected(function () {
            client.getBookmarks(function (err, res) {
                if (err) return;

                const mucs = res.privateStorage.bookmarks.conferences || new MUCs();
                mucs.forEach(function (muc: MUC) {
                    self.add(muc);
                    if (muc.autoJoin) {
                        self.get(muc.jid.bare).join();
                    }
                });

                self.trigger('loaded');
            });
        });
    }

    save (cb) {
        const self = this;
        app.whenConnected(function () {
            const models = [];
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
