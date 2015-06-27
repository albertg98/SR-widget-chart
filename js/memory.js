/*Appmemory*/
var appmemory = new SR.AppMemory(SR.AppID, SR.UserID);
	appmemory.initMemory({
		ticker: 'A',
		indlist: [
			'sma-15-black-close',
			'ema-15-green-close'
		]
	});
/*Global variables*/
var indList;
/**
 * Creates Inputs for indicators
 * @param  {String} type   
 * @param  {Number} period 
 * @param  {String} price  
 * @param  {String} color  
 * @return {}        
 */
function inputPush (type, period, price, color)	{
		price = price || 'close';
	var html = $('<div class="alert alert-warning alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span class="alert-x" aria-hidden="true">×</span></button><span class="alert-text"></span></div>');
		html.css({"background-color": color});
		html.find('span').append($('<strong> ' + type.toUpperCase() + '</strong>'));
		html.find('span').append($('<i> (' + period + ')</i>'));
		html.find('.alert-text').append($('<span> - ' + price + '</span>'));
		html.find('.alert-text').append($('<span> - ' + color + '</span>'));
		html[0].id = type + '-' + period + '-' + color + '-' + price;
		html.click(function(me){
			console.log(me.target.parentElement.id);
			getANDplot.chart.indicators.del(me.target.parentElement.id).refresh();
		});
		$('#ind-cnt').append(html);
}


