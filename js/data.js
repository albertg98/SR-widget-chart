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
					var sData = [];
					async.map(data.response.data, function (val) {
						sData.push({
							date: new Date(val[0]).getTime(),
							open: val[1],
							low: val[2],
							high: val[3],
							close: val[4],
							volume: val[5],
							ExDividend: val[6],
							name: data.response.stock_name
						});
						if(sData.length === data.response.data.length){
							getData[ticker] = {
								name  : data.response.stock_name,
								ticker: data.response.ticker,
								data  : sData
							};
							res(getData[ticker]);
						}
					});
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
function getANDplot (ticker, mainChart, from, to) {
	from = getANDplot.from || from;
	to = getANDplot.to || to;
	mainChart = getANDplot.mainChart || mainChart;
	return new Promise(function(res, rej){
		$('.loading').css({width:'100%',opacity:1});
		getData(ticker,from,to).then(function(data){
			getANDplot.from = from;
			getANDplot.to = to;
			getANDplot.mainChart = mainChart;
			mainChart.draw({
				height: window.innerHeight, 
				width: window.innerWidth
			}, data.data).then(function (chart) {
				$('#ticker').val(data.ticker + '/' + (data.name?data.name:data.ticker));
				chart.title((data.name?data.name:data.ticker), {size:20, sizemod:true});
				$('.loading').css({width:'0%',opacity:0});
				$('.ticker-input').css({opacity: 0});
				res();
			},function(reason){
				console.log(reason);
				$('.loading').css({width:'0%',opacity:0});
				$('.ticker-input').css({opacity: 0});
			});
		},function(reason){
			console.log(reason);
			$('.loading').css({width:'0%',opacity:0});
			$('.ticker-input').css({opacity: 0});
		});
	});
}