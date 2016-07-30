export default class ArchiveStorage {
    constructor (public storage) {}

    setup (db) {
        if (db.objectStoreNames.contains('archive')) {
            db.deleteObjectStore('archive');
        }
        const store = db.createObjectStore('archive', {
            keyPath: 'archivedId'
        });
        store.createIndex('owner', 'owner', {unique: false});
    }

    transaction (mode) {
        const trans = this.storage.db.transaction('archive', mode);
        return trans.objectStore('archive');
    }

    add (message, cb) {
        cb = cb || function () {};
        const request = this.transaction('readwrite').put(message);
        request.onsuccess = function () {
            cb(false, message);
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
            request.result.acked = true;
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
                cursor.value.acked = true;
                results.push(cursor.value);
                cursor.continue();
            } else {
                cb(false, results);
            }
        };
        request.onerror = cb;
    }

    value = ArchiveStorage;
}
