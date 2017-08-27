import Storage from '.';

interface Avatar {
    id: string; // sha1 hash
    dataURI: string;
}

export default class AvatarStorage {
    constructor(public storage: Storage) {}

    setup(db: IDBDatabase) {
        if (db.objectStoreNames.contains('avatars')) {
            db.deleteObjectStore('avatars');
        }
        db.createObjectStore('avatars', {
            keyPath: 'id'
        });
    }

    transaction(mode: IDBTransactionMode) {
        const trans = this.storage.db.transaction('avatars', mode);
        return trans.objectStore('avatars');
    }

    add(avatar: Avatar, cb: (error: false | Event, avatar?: Avatar) => void) {
        cb = cb || function () {};
        const request = this.transaction('readwrite').put(avatar);
        request.onsuccess = function () {
            cb(false, avatar);
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
            cb(false, request.result);
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

    value = AvatarStorage;
}
