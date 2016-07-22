/*global indexedDB*/
"use strict";

import AvatarStorage from './avatars'
import RosterStorage from './roster'
import DiscoStorage from './disco'
import ArchiveStorage from './archive'
import ProfileStorage from './profile'

export class Storage {
    
    open (cb) {
        cb = cb || function () {};

        var self = this;
        var request = indexedDB.open('datastorage', this.version);
        request.onsuccess = function (e) {
            self.db = e.target['result'];
            cb(false, self.db);
        };
        request.onupgradeneeded = function (e) {
            var db = e.target['result'];
            self.avatars.setup(db);
            self.roster.setup(db);
            self.disco.setup(db);
            self.archive.setup(db);
            self.profiles.setup(db);
        };
        request.onerror = cb;
    }
    
    version = 3    
    
    db = null
    init = []

    avatars = new AvatarStorage(this)
    roster = new RosterStorage(this)
    disco = new DiscoStorage(this)
    archive = new ArchiveStorage(this)
    profiles = new ProfileStorage(this)
    
    value = Storage
}