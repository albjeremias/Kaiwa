"use strict";

import Resource from './models/resource'
import Collection from './models/baseCollection'

export default class Resources extends Collection<Resource> {
    comparator(res1, res2): number {
        var name1 = res1.mucDisplayName.toLowerCase(),
            name2 = res2.mucDisplayName.toLowerCase();
        return (name1 > name2) ? 1 : 
            (name1 < name2) ? -1 : 0;
    }
    
    search (letters, removeMe, addAll) {
        if(letters == "" && !removeMe) return this;

        var collection = this;
        if (addAll) {
            const resource = new Resource({this.parent.jid.bare + '/all'})
            collection.push(resource);
        }

        var pattern = new RegExp('^' + letters + '.*$', "i");
        var filtered = collection.filter(function(data) {
            var nick = data.get("mucDisplayName");
            if (nick === me.nick) return false;
            return pattern.test(nick);
        });
        return new module.exports(filtered);
    }
}