/**
 * Gets data from the API
 * @param  {Stirng} ticker 
 * @param  {Date/Number/String} from   
 * @param  {Date/Number/String} to     
 * @return {Promise}        
 */
function getData (ticker, from, to) {
	console.log(from, to)
	return new Promise(function (res, rej) {
		if(!getData[ticker + '|' + from + '->' + to])	{
			SR.AppData.v1.direct.GET(ticker, 'pricedata',{from: from,to:to}).then(function (data) {
				if(data.response.data.length > 0)	{
					getData[ticker + '|' + from + '->' + to] = {
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
					res(getData[ticker + '|' + from + '->' + to]);
				}	else	{
					rej('No Data Available')
				}
			}, rej);
		}	else	{
			res(getData[ticker + '|' + from + '->' + to]);
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
	from = from || getANDplot.from;
	to = to || getANDplot.to;
	ticker = ticker || getANDplot.ticker;
	return new Promise(function(res, rej){
		$('#ind-cnt').html('');
		$('.ticker-input').css({opacity: 0});
		$('.loading').css({width:'100%',opacity:1});
		getData(ticker,from,to).then(function(data){
			getANDplot.chart.init(data.data, {
				background: "white",
				stroke: null,
				title: data.name, 
				xlab: 'Price ($)', 
				style: getANDplot.type,
				crosshair: {col: 'black'},
				plots: {
					main: {
						style: (getANDplot.type || 'candlestick')
					},
					volume: {
						col: '#D4D4E7'
					},
					bottom: {
						col: '#80A0D7'
					}
				}
			}).next(function () {
				$('#ticker').val(data.ticker + '/' + (data.name?data.name:data.ticker));
				$('.loading').css({width:'0%',opacity:0});
				$('.ticker-input').css({opacity: 0});
				return data.ticker;
			}).next(function(ticker){
				getANDplot.from = from;
				getANDplot.to = to;
				getANDplot.ticker = ticker;
				appmemory.save('ticker', ticker).then(function(){
					console.log('updated ticker!');
				}, function(){
					console.warn('failed to update!');
				});
			});
		},function(reason){
			if(reason[1]&& (reason[1] === "error" || reason[1] === "timeout"))	{
				FAIL('<i class="glyphicon glyphicon-flash"></i> Bad Internet connection, please check with your provider.');
			}	else	if(reason === "No Data Available")	{
				FAIL('<i class="glyphicon glyphicon-flag"></i> We are sorry, we do not have this price-data yet.');
			}	else	{
				FAIL("Failed to get ticker due to `" + reason + "`");
				console.log(reason);
			}
			$('.loading').css({width:'0%',opacity:0});
			$('.ticker-input').css({opacity: 0});
		}).then(function(){
			indList.forEach(function(val){
				addInd.apply(window, val.split('-'));
			});
			res();
		});
	});
}
/*Set defaults*/
getANDplot.type = 'candlestick';
getANDplot.from = "2012-01-01";
getANDplot.to = "2014-01-01";
/**
 * Add an indicator
 * @param {Strin} type   
 * @param {Number} period 
 * @param {String} color  
 * @param {String} price  
 */
function addInd (type, period, color, price)	{
	type = type || 'sma';
	period = Number(period) || 15;
	color = color || getRandomColor();
	var id = type + '-' + period + '-' + color + '-' + price;
	inputPush(type, period, price, color);
	indList = Object.keys(getANDplot.chart.indicators.add(id, [type, color, period]).refresh().get());
	appmemory.save('indlist', indList).then(function(){});
	return indList;
}