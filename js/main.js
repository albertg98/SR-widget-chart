var chart;
$(document).ready(function () {
	/*Set Events*/
	$('#ticker')[0].onmouseenter = function () {
		$('.ticker-input').css({opacity: 1});
	}
	$('#chart')[0].onclick = function () {
		$('.ticker-input').css({opacity: 0});
	}
	$('#ticker-change')[0].onclick = function(){
		$('.ticker-input').css({opacity: 0});
		getANDplot($('#ticker').val().split('/')[0]);
	}
	$(document).keypress(function(e) {
		if(e.which == 13) {
			$('#ticker-change')[0].onclick();
		}
	});
	$('#addind')[0].onclick = function()	{
		addInd(/strong>(.*?)<\/strong/i.exec($("#select-type .selected-label").html())[1].toLowerCase(),
			Number($("#periods").val()),
			'',
			getRandomColor(),
			true
			);
	};
	/*Load typehead*/
	SR.AppData.v1.Tickerlist.GET('j').then(function (tickerlist) {
		var tickers = new Bloodhound({
			local: tickerlist.response.map(function(val){
				return val.ticker + '/' + (val.name||val.ticker);
			}),
			queryTokenizer: Bloodhound.tokenizers.nonword,
			datumTokenizer: Bloodhound.tokenizers.nonword
		});
		$('#ticker').typeahead({
			hint: true,
			highlight: true
		}, {
			limit: 5,
			source: tickers,
			templates: {
				empty: [
				'<div class="empty-message">',
				'No match',
				'</div>'
				].join('\n'),
				suggestion: function(item, d){
					return $('<div class="suggestion"><strong>' + item.split('/')[0] + '</strong> - ' + item.split('/')[1] + '</div>')[0];
				}
			}
		});
	});
	/*Load first plot*/
	appmemory.load('indlist').then(function(indlist){
		appmemory.load('ticker').then(function (ticker) {
			indList = indlist;
			getANDplot.chart = new techan.Chart('#chart', 
				function(){
					return	{
						height: 0.9*window.innerHeight,
						width: 0.99*window.innerWidth
					}
				}
			);
			getANDplot(ticker, "2012-01-01", "2015-01-01").then(function(){
				
			});
		}).then(function(){
			$('.loading').css({width:'0%',opacity:0})
		});
	});
});