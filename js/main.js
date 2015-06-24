$(document).ready(function () {
	var mainChart = new Chart("#chart");
	/*Set Events*/
	$('.input-group')[0].onmouseenter = function () {
		$('.input-group').css({opacity: 1})
	}
	$('#chart')[0].onclick = function () {
		$('.input-group').css({opacity: 0})
	}
	$('#ticker-change')[0].onclick = function(){
		getANDplot($('#ticker').val().split('/')[0]);
	}
	/*Load typehead*/
	SR.AppData.v1.Tickerlist.GET('j').then(function (tickerlist) {
		/*Set Typehead*/
		var tickers = new Bloodhound({
			local: tickerlist.response.map(function(val){
				return val.ticker + '/' + (val.name?val.name:val.ticker);
			}),
			queryTokenizer: Bloodhound.tokenizers.nonword,
			datumTokenizer: Bloodhound.tokenizers.nonword
		});
		$('#ticker').typeahead({
				hint: true,
				highlight: true
			},
			{
				limit: 5,
				source: tickers
		});
	});
	/*Load first plot*/
	appmemory.load('ticker').then(function (ticker) {
		getANDplot(ticker, mainChart, "2012-01-01", "2013-01-01").then(function(){});
	}).then(function(){
		$('.loading').css({width:'0%',opacity:0})
	});
});