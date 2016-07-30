export default class DiscoStorage {
    constructor (public storage) {}

    setup (db) {
        if (db.objectStoreNames.contains('disco')) {
            db.deleteObjectStore('disco');
        }
        db.createObjectStore('disco', {
            keyPath: 'ver'
        });
    }

    transaction (mode) {
        const trans = this.storage.db.transaction('disco', mode);
        return trans.objectStore('disco');
    }

    add (ver, disco, cb) {
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

    get (ver, cb) {
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
