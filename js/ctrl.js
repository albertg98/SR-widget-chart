$(document).ready(function () {
	/*Date-range*/
	$('.input-daterange').datepicker({
		startView: 1,
		todayBtn: "linked",
		orientation: "top auto",
		todayHighlight: true
	}).find('#from-date').datepicker('update', new Date(getANDplot.from)).element
	.on("changeDate", function(data) {
		getANDplot.from = data.date.getTime();
		getANDplot();
	})
	.parent().find('#to-date').datepicker('update', new Date(getANDplot.to)).element
	.on("changeDate", function(data) {
		getANDplot.to = data.date.getTime();
		getANDplot();
	});
	/*Main plot-type*/
	$("#select-main-type").combobox().on('changed.fu.combobox', function (evt, data) {
		getANDplot.type = data.value;
		getANDplot();
	});
	/*Ticker Menu*/
	$('#ticker')[0].onmouseenter = function () {
		$('.ticker-input').css({opacity: 1});
	}
	$('#chart')[0].onclick = function () {
		$('.ticker-input').css({opacity: 0});
	}
	/*Ticker Change*/
	$('#ticker-change')[0].onclick = function(){
		getANDplot($('#ticker').val().split('/')[0]);
	}
	$(document).keypress(function(e) {
		if(e.which == 13) {
			$('#ticker-change')[0].onclick();
		}
	});
	/*Indicator colorpicker*/
	$('.ind-color').colorpicker({color:getRandomColor()});
	/*Indicator types*/
	$("#select-type").combobox();
	/*Add function*/
	$('#addind')[0].onclick = function()	{
		addInd(
			/strong>(.*?)<\/strong/i.exec($("#select-type .selected-label").html())[1].toLowerCase(),
			Number($("#periods").val()),
			$('.ind-color').colorpicker('getValue'),
			'close'
			);
		$('.ind-color').colorpicker('setValue',getRandomColor());
	};
})