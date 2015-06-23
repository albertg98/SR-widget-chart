function getData (ticker, from, to) {
	return new Promise(function (res, rej) {
		if(!getData[ticker])	{
			SR.AppData.v1.direct.GET(ticker, 'pricedata',{from: from,to:to}).then(function (data) {
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
						getData[ticker] = sData;
						res(sData);
					}
				});
			});
		}	else	{
			res(getData[ticker]);
		}
	});
}