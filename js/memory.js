var appmemory = new 	SR.AppMemory(SR.AppID, SR.UserID);

appmemory.save('ticker', 'A').then(function () {
	console.log('successful save!');
},function (fail) {
	console.log('failed to save due to', fail)
});

function alertCtrl (type, period, price, color)	{
	var html = $('<div class="alert alert-warning alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button></div>');
		html.append($('<strong>' + type + '</strong>'));
		html.append($('<i> (' + period + ')</i>'));
		html.append($('<span> - ' + period + '</span>'));
		html.append($('<span> - ' + color + '</span>'));
		$('#ind-cnt').append(html);
}