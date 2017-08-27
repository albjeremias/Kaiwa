import AvatarStorage from './avatars';
import RosterStorage from './roster';
import DiscoStorage from './disco';
import ArchiveStorage from './archive';
import ProfileStorage from './profile';

export default class Storage {
    open(cb: (error: false | Event, result?: IDBDatabase) => void) {
        cb = cb || function () {};

        const self = this;
        const request = indexedDB.open('datastorage', this.version);
        request.onsuccess = function (e) {
            self.db = (e.target as any).result as IDBDatabase;
            cb(false, self.db);
        };
        request.onupgradeneeded = function (e) {
            const db = (e.target as any).result as IDBDatabase;
            self.avatars.setup(db);
            self.roster.setup(db);
            self.disco.setup(db);
            self.archive.setup(db);
            self.profiles.setup(db);
        };
        request.onerror = cb;
    }

    version = 3;

    db: IDBDatabase;
    init = [];

    avatars = new AvatarStorage(this);
    roster = new RosterStorage(this);
    disco = new DiscoStorage(this);
    archive = new ArchiveStorage(this);
    profiles = new ProfileStorage(this);

    value = Storage;
}
