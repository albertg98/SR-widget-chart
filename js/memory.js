var appmemory = new 	SR.AppMemory(SR.AppID, SR.UserID);

appmemory.save('ticker', 'A').then(function () {
	console.log('successful save!');
},function (fail) {
	console.log('failed to save due to', fail)
});
