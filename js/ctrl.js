$(document).ready(function () {
	/*Initilize Pickers*/
	$('.ind-color').colorpicker({color:getRandomColor()});
	$('.input-daterange').datepicker({
		startView: 1,
		todayBtn: "linked",
		orientation: "top auto",
		calendarWeeks: true,
		todayHighlight: true
	});
	/*Set Events*/
		/*Ticker Menu*/
		$('#ticker')[0].onmouseenter = function () {
			$('.ticker-input').css({opacity: 1});
		}
		$('#chart')[0].onclick = function () {
			$('.ticker-input').css({opacity: 0});
		}
		/*Ticker Change*/
		$('#ticker-change')[0].onclick = function(){
			$('.ticker-input').css({opacity: 0});
			$('#ind-cnt').html('');
			getANDplot($('#ticker').val().split('/')[0]);
		}
		$(document).keypress(function(e) {
			if(e.which == 13) {
				$('#ticker-change')[0].onclick();
			}
		});
		/*Add Indicator*/
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