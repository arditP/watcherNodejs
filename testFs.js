fs = require('fs');

try {
	var a = fs.watch('./New folder', function(event, file) {
		try{
			console.log("Event: %s", event);
		} catch(e) {console.log("ERRROR!");}
	})
	a.on('error', function(err) {
		console.log('Error!' +  err);
	})
} catch(e) {console.log("error!" +  e);}