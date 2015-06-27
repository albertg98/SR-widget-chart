/**
 * Gets data from the API
 * @param  {Stirng} ticker 
 * @param  {Date/Number/String} from   
 * @param  {Date/Number/String} to     
 * @return {Promise}        
 */
function getData (ticker, from, to) {
	return new Promise(function (res, rej) {
		if(!getData[ticker])	{
			SR.AppData.v1.direct.GET(ticker, 'pricedata',{from: from,to:to}).then(function (data) {
				if(data.response.data.length > 0)	{
					getData[ticker] = {
						name  : data.response.stock_name,
						ticker: data.response.ticker,
						data  : data.response.data.map(function(val){
							return {
								date: new Date(val[0]).getTime(),
								open: val[1],
								low: val[2],
								high: val[3],
								close: val[4],
								volume: val[5],
								ExDividend: val[6],
								name: data.response.stock_name
							}
						}).reverse()
					};
					res(getData[ticker]);
				}	else	{
					rej('No Data Available')
				}
			}, rej);
		}	else	{
			res(getData[ticker]);
		}
	});
}

/**
 * Get Data and plot
 * @param  {String} ticker    
 * @param  {Chart} mainChart 
 * @param  {Date/Number/String} from   
 * @param  {Date/Number/String} to     
 * @return {Promise} 
 */
function getANDplot (ticker, from, to) {
	from = getANDplot.from || from;
	to = getANDplot.to || to;
	return new Promise(function(res, rej){
		$('.loading').css({width:'100%',opacity:1});
		getData(ticker,from,to).then(function(data){
			getANDplot.chart.init(data.data, {title:data.name}
				).next(function () {
				$('#ticker').val(data.ticker + '/' + (data.name?data.name:data.ticker));
				$('.loading').css({width:'0%',opacity:0});
				$('.ticker-input').css({opacity: 0});
				return data.ticker;
			}).next(function(ticker){
				getANDplot.from = from;
				getANDplot.to = to;
				appmemory.save('ticker', ticker).then(function(){
					console.log('updated ticker!');
				}, function(){
					console.warn('failed to update!');
				});
			});
		},function(reason){
			console.log(reason);
			$('.loading').css({width:'0%',opacity:0});
			$('.ticker-input').css({opacity: 0});
		}).then(function(){
			indList.forEach(function(val){
				console.log(val.split('-'));
				addInd.apply(window, val.split('-'));
			});
			res();
		},rej);
	});
}

function addInd (type, period, color, price)	{
	type = type || 'sma';
	period = Number(period) || 15;
	color = color || getRandomColor();
	var id = type + '-' + period + '-' + color + '-' + price;
	console.log(id);
	indList = Object.keys(getANDplot.chart.indicators.add(id, [type, color, period]).refresh().get());
	return indList;
}