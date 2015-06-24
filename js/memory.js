var appmemory = new SR.AppMemory(SR.AppID, SR.UserID);
var indList;

appmemory.save('ticker', 'A').then(function () {
	console.log('successful ticker save!');
},function (fail) {
	console.log('failed to save due to', fail)
});
appmemory.save('indlist', [
		{type: 'sma', period: 20, price: 'close', color: 'green'},
		{type: 'ema', period: 20, price: 'close', color: 'blue'},
	]).then(function () {
	console.log('successful ind save!');
},function (fail) {
	console.log('failed to save due to', fail)
});

function alertCtrl (type, period, price, color)	{
		price = price || 'close';
	var html = $('<div class="alert alert-warning alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span class="alert-x" aria-hidden="true">×</span></button><span class="alert-text"></span></div>');
		html.find('span').append($('<strong> ' + type.toUpperCase() + '</strong>'));
		html.find('span').append($('<i> (' + period + ')</i>'));
		html.find('.alert-text').append($('<span> - ' + price + '</span>'));
		html.find('.alert-text').append($('<span> - ' + color + '</span>'));
		$('#ind-cnt').append(html);
		$('.alert-dismissible .close').click(function(me){
			// console.log(me);
			mainChart.clearInd(type + '-' + period + '-' + color);
		});
}

function addInd (type, period, price, color)	{
	indList.push({type: type, period: period, price: price, color: color});
	mainChart.addMA(period, color, type);
	alert('!');
	appmemory.save('indlist',indList).then(function(){
		alertCtrl (type, period, price, color);
		console.log('updated indlist!');
	}, function(){
		console.warn('failed to update indlist');
	})
}

