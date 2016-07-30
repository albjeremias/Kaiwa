// SCHEMA
//    jid: string
//    name: string
//    subscription: string
//    groups: array
//    rosterID: string

export default class RosterStorage {
    constructor(public storage) {}

    setup (db) {
        if (db.objectStoreNames.contains('roster')) {
            db.deleteObjectStore('roster');
        }
        const store = db.createObjectStore('roster', {
            keyPath: 'storageId'
        });
        store.createIndex('owner', 'owner', {unique: false});
    }

    transaction (mode) {
        const trans = this.storage.db.transaction('roster', mode);
        return trans.objectStore('roster');
    }

    add (contact, cb) {
        cb = cb || function () {};
        const request = this.transaction('readwrite').put(contact);
        request.onsuccess = function () {
            cb(false, contact);
        };
        request.onerror = cb;
    }

    get (id, cb) {
        cb = cb || function () {};
        if (!id) {
            return cb('not-found');
        }
        const request = this.transaction('readonly').get(id);
        request.onsuccess = function (e) {
            const res = request.result;
            if (res === undefined) {
                return cb('not-found');
            }
            cb(false, request.result);
        };
        request.onerror = cb;
    }

    getAll (owner, cb) {
        cb = cb || function () {};
        const results = [];

        const store = this.transaction('readonly');
        const request = store.index('owner').openCursor(IDBKeyRange.only(owner));
        request.onsuccess = function (e) {
            const cursor = e.target.result;
            if (cursor) {
                results.push(cursor.value);
                cursor.continue();
            } else {
                cb(false, results);
            }
        };
        request.onerror = cb;
    }

    remove (id, cb) {
        cb = cb || function () {};
        const request = this.transaction('readwrite')['delete'](id);
        request.onsuccess = function (e) {
            cb(false, request.result);
        };
        request.onerror = cb;
    }

    clear (cb) {
        cb = cb || function () {};
        const request = this.transaction('readwrite').clear();
        request.onsuccess = function () {
            cb(false, request.result);
        };
        request.onerror = cb;
    }

    value = RosterStorage;
}
