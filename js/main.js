$(document).ready(function () {
	window._chart = new Chart("#chart");
	getData('AAPL','2010-01-02','2012-01-10').then(function(data){
		_chart.draw(data);
	});
});