var fs = require('fs');
var events = require('events');
var util = require('util');
var path = require('path');

/* 
 TODO: 
 1) differentiate between directory and filechanges
 2) add rename event
 3) add move event
*/

exports.watch = function(src) {
    var watcher = new Watcher();
    watcher.addWatch(src);
    return watcher;
}

function Watcher() {
    events.EventEmitter.call(this)
}

util.inherits(Watcher, events.EventEmitter)

Watcher.prototype.watchers = []

Watcher.prototype.addWatch = function(watchSrc) {
    var self = this
    var lastChanged = null;
    try {
        // check if the watchSrc is a directory and iterate over it
        if(isDirectory(getStats(watchSrc))) {
            fs.readdirSync(watchSrc).forEach(function(file) {
                self.addWatch(path.join(watchSrc, file));
            })
        }
        self.watchers[watchSrc] = fs.watch(watchSrc, function(event, file) {
            if(exists(watchSrc)) {
                var stats = getStats(watchSrc);
                if(isFile(stats)) {
                    if(lastChanged === null || stats.mtime.getTime() > lastChanged)
                        self.changeEvent(watchSrc, stats);
                    lastChanged = stats.mtime.getTime();
                } else if(isDirectory(stats)) {
                    // check to see if the dir is new
                    if(self.watchers[watchSrc] === undefined)
                        self.createEvent(watchSrc, stats);
                    
                    // check the new dir for new files
                    fs.readdirSync(watchSrc).forEach(function(file) {
                        file = path.join(watchSrc, file)
                        if (self.watchers[file] === undefined) {
                            self.addWatch(file)
                            self.createEvent(file, fs.statSync(file))
                        }
                    })
                } 
            } else if (file){
                self.removeWatch(watchSrc);
                self.deleteEvent(watchSrc);
            }
        })
    } catch(e) {
        console.log("Exception: " + e);
    }
    // add an error event;
    self.watchers[watchSrc].on('error', function(err) {
        self.removeWatch(watchSrc);
        self.deleteEvent(watchSrc);
    })
    self.emit('watch', watchSrc);
}

Watcher.prototype.checkRename = function(stats1, stats2) {
    return equalStats(stat1, stat2);
}

Watcher.prototype.createEvent = function(file, stats) {
    if(isDirectory(stats))
        this.emit('createDirectory', file, stats);
    else if(isFile(stats))
        this.emit('createFile', file, stats);
}

Watcher.prototype.changeEvent = function(file, stats) {
    this.emit('change', file, stats);
}

Watcher.prototype.deleteEvent = function(file) {
	try {
        this.emit('delete', file);
    } catch(e) {
        console.log(e);
    }
}

Watcher.prototype.removeWatch = function(src) {
    var self = this
    if(isDirectory(getStats(src))) {
        // remove all watches inside of this directory
        for(var key in self.watchers) {
            if(key.indexOf(src) === 0) {
                self.removeWatch(key);
            }
        }
    }
    if (self.watchers[src] !== undefined) {
        self.watchers[src].close()
        delete self.watchers[src]
    }
    self.emit('unwatch', src)
}

Watcher.prototype.clear = function() {
    for (var file in this.watchers) {
        self.unwatch(file)
    }
}

//  helper functions
function getStats(dir) {
    try {
        return fs.statSync(dir);
    } catch(e) {return null}
}

function isDirectory(stats) {
    try {
        return stats.isDirectory();
    } catch(e) {return false}
}

function isFile(stats) {
    try {
        return stats.isFile();
    } catch(e) {return false}        
}

function exists(src) {
    try {
        return fs.existsSync(src);
    } catch(e) {return false}
}

function equalStats(stat1, stat2) {
    return (
            equalTime(stat1.atime, stat2.atime) &&
            equalTime(stat1.mtime, stat2.mtime) &&
            equalTime(stat1.ctime, stat2.ctime) &&
            stat1.mode == stat2.mode &&
            stat1.size == stat2.size
        );
}

function equalTime(time1, time2) {
    return (
            time1.getTime() == time2.getTime() &&
            time1.getDate() == time2.getDate() &&
            time1.getYear() == time2.getYear()
        );
}
Array.prototype.last = function() {
    return this[this.length -1]
}