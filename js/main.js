$(document).ready(function () {
	$('.alert-danger').css({"opacity":0});
	$('.alert-success').css({"opacity":0});
	
	_chart = new Chart("#chart");
	getData('AAPL','2010-01-02','2012-01-10').then(function(data){
		_chart.draw({height: window.innerHeight, width: window.innerWidth}, data);
		getData('A','2010-01-02','2012-01-10').then(function(A){
			_chart.add(A);
			console.log(A)
		});
	});
});