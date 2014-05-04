var Watcher = require('./watcher.js');
var watcher = Watcher.watch('../watcher');

Array.prototype.last = function() {
    return this[this.length -1]
}

a = [1, 2, 3, 4]
console.log(a.last());
watcher.on('createFile', function(filename, stats) {
	console.log('File created %s', filename);
});

watcher.on('createDirectory', function(filename, stats) {
	console.log('Dir created %s', filename);
});

watcher.on('change', function(filename, stats) {
	console.log('File changed %s', filename);
});

watcher.on('delete', function(filename) {
	console.log('File deleted %s', filename);
});

watcher.on('watch', function(filename) {
	console.log('Watching:' + filename);
});