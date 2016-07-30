import Collection from './Collection';
import Me from './Me';
import Resource from './resource';

declare const me: Me;

export default class Resources extends Collection<Resource> {
    comparator(res1, res2): number {
        const name1 = res1.mucDisplayName.toLowerCase(),
            name2 = res2.mucDisplayName.toLowerCase();
        return (name1 > name2) ? 1 :
            (name1 < name2) ? -1 : 0;
    }

    search (letters, removeMe, addAll) {
        if (letters === '' && !removeMe) return this;

        const collection = this;
        if (addAll) {
            const resource = new Resource({id: this.parent.jid.bare + '/all'});
            collection.add(resource);
        }

        const pattern = new RegExp('^' + letters + '.*$', 'i');
        const filtered = collection.filter(function(data) {
            const nick = data.mucDisplayName;
            if (nick === me.nick) return false;
            return pattern.test(nick);
        });
        return new module.exports(filtered);
    }
}
