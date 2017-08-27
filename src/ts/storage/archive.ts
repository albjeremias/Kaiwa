import Storage from '.';

export default class ArchiveStorage {
    constructor (public storage: Storage) {}

    setup(db: IDBDatabase) {
        if (db.objectStoreNames.contains('archive')) {
            db.deleteObjectStore('archive');
        }
        const store = db.createObjectStore('archive', {
            keyPath: 'archivedId'
        });
        store.createIndex('owner', 'owner', {unique: false});
    }

    transaction(mode: IDBTransactionMode) {
        const trans = this.storage.db.transaction('archive', mode);
        return trans.objectStore('archive');
    }

    add(message: any, cb: (error: false | Event, message?: any) => void) {
        cb = cb || function () {};
        const request = this.transaction('readwrite').put(message);
        request.onsuccess = function () {
            cb(false, message);
        };
        request.onerror = cb;
    }

    get(id: any, cb: (error: false | string | Event, result?: any) => void) {
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

    getAll(owner: any, cb: (error: false | Event, result?: any[]) => void) {
        cb = cb || function () {};
        const results: any[] = [];

        const store = this.transaction('readonly');
        const request = store.index('owner').openCursor(IDBKeyRange.only(owner));
        request.onsuccess = function (e) {
            const cursor = (e.target as any).result;
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
