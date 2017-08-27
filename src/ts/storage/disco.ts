import Storage from '.';

interface DiscoData {
    ver: any;
    disco: any;
}

export default class DiscoStorage {
    constructor (public storage: Storage) {}

    setup(db: IDBDatabase) {
        if (db.objectStoreNames.contains('disco')) {
            db.deleteObjectStore('disco');
        }
        db.createObjectStore('disco', {
            keyPath: 'ver'
        });
    }

    transaction(mode: IDBTransactionMode) {
        const trans = this.storage.db.transaction('disco', mode);
        return trans.objectStore('disco');
    }

    add(ver: any, disco: any, cb: (error: false | Event, result?: DiscoData) => void) {
        cb = cb || function () {};
        const data = {
            ver: ver,
            disco: disco
        };
        const request = this.transaction('readwrite').put(data);
        request.onsuccess = function () {
            cb(false, data);
        };
        request.onerror = cb;
    }

    get(ver: any, cb: (error: false | string | Event, disco?: any) => void) {
        cb = cb || function () {};
        if (!ver) {
            return cb('not-found');
        }
        const request = this.transaction('readonly').get(ver);
        request.onsuccess = function (e) {
            const res = request.result;
            if (res === undefined) {
                return cb('not-found');
            }
            cb(false, res.disco);
        };
        request.onerror = cb;
    }

    value = DiscoStorage;
}
