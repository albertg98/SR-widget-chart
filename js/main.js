var chart;
$(document).ready(function () {
	if(window.location.hostname === "localhost" && window.location.port === "8080"){
		SR.LOCAL = true;
	};
	/*Load typehead*/
	function typeaheadLoad(cnt) {cnt = cnt || 0;
		SR.AppData.v1.Tickerlist.GET('j').then(function (tickerlist) {
			var tickers = new Bloodhound({
				local: tickerlist.response.map(function(val){
					return val.ticker + '/' + (val.name||val.ticker);
				}),
				queryTokenizer: Bloodhound.tokenizers.nonword,
				datumTokenizer: Bloodhound.tokenizers.nonword
			});
			window.tickers = tickers;
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
		},function(reason){
			console.log(reason);
			if(reason[1] === 'timeout' && cnt < 2)	{
				typeaheadLoad(cnt+1);
			}	else	{
				FAIL("Could not load tiker-list due to `" + reason[1] + '`');
			}
		});
	};
	typeaheadLoad();
	/*Load first plot*/
	appmemory.load('indlist').then(function(indlist) {
		appmemory.load('ticker').then(function (ticker) {
			appmemory.load('supstances').then(function(sups) {
				indList 	= indlist;
				supstances 	= sups;
				getANDplot.chart = new techan.Chart('#chart', 
					function(){
						return	{
							height: 0.9*window.innerHeight,
							width: 0.99*window.innerWidth
						}
					}
					);
				getANDplot(ticker).then(function(){
					$('.loading').css({
						'width'   : '0%',
						'opacity' : '0px',
						'height'  : '0%',
					})
				});
			});
		})
	});
});
