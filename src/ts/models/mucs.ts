import App from './App';

declare const app: App;
declare const client: any;

import Collection from './Collection';
import MUC from './muc';

interface MucData {
    name: string;
    jid: { bare: string; };
    nick: string;
    autoJoin: boolean;
}

export default class MUCs extends Collection<MUC> {
    comparator(model1: MUC, model2: MUC) {
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
            client.getBookmarks(function (err: any, res: any) {
                if (err) return;

                const mucs = res.privateStorage.bookmarks.conferences || new MUCs();
                mucs.forEach(function (muc: MUC) {
                    self.add(muc);
                    if (muc.autoJoin) {
                        const mucObject = self.get(muc.jid.bare);
                        if (mucObject) {
                            mucObject.join();
                        }
                    }
                });

                self.trigger('loaded');
            });
        });
    }

    save(cb: Function) {
        const self = this;
        app.whenConnected(function () {
            const models: MucData[] = [];
            self.forEach(function (model) {
                models.push({
                    name: model.name,
                    jid: model.jid,
                    nick: model.nick,
                    autoJoin: model.autoJoin
                });
            });
            client.setBookmarks({ conferences: models }, cb);
        });
    }
}
