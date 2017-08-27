import Storage from '.';

interface Contact {
    jid: string;
    name: string;
    subscription: string;
    groups: any[];
    rosterID: string;
}

export default class RosterStorage {
    constructor(public storage: Storage) {}

    setup(db: IDBDatabase) {
        if (db.objectStoreNames.contains('roster')) {
            db.deleteObjectStore('roster');
        }
        const store = db.createObjectStore('roster', {
            keyPath: 'storageId'
        });
        store.createIndex('owner', 'owner', {unique: false});
    }

    transaction(mode: IDBTransactionMode) {
        let x = this.storage.init;
        const trans = this.storage.db.transaction('roster', mode);
        return trans.objectStore('roster');
    }

    add(contact: Contact, cb: (error: false | Event, contact?: Contact) => void) {
        cb = cb || function () {};
        const request = this.transaction('readwrite').put(contact);
        request.onsuccess = function () {
            cb(false, contact);
        };
        request.onerror = cb;
    }

    get(id: any, cb: (error: false | string | Event, result?: Contact) => void) {
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

    getAll(owner: any, cb: (error: false | Event, results?: Contact[]) => void) {
        cb = cb || function () {};
        const results: Contact[] = [];

        const store = this.transaction('readonly');
        const request = store.index('owner').openCursor(IDBKeyRange.only(owner));
        request.onsuccess = function (e) {
            const cursor = (e.target as any).result;
            if (cursor) {
                results.push(cursor.value);
                cursor.continue();
            } else {
                cb(false, results);
            }
        };
        request.onerror = cb;
    }

    remove(id: any, cb: (error: false | Event, result?: any) => void) {
        cb = cb || function () {};
        const request = this.transaction('readwrite')['delete'](id);
        request.onsuccess = function (e) {
            cb(false, request.result);
        };
        request.onerror = cb;
    }

    clear(cb: (error: false | Event, result?: any) => void) {
        cb = cb || function () {};
        const request = this.transaction('readwrite').clear();
        request.onsuccess = function () {
            cb(false, request.result);
        };
        request.onerror = cb;
    }

    value = RosterStorage;
}
