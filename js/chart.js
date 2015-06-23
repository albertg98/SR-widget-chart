function Chart (cntId) {
	/*Define Globals*/
	var margin,width,height,x,y,candlestick,yAxis,xAxis,svg,data,
		zoom = d3.behavior.zoom()
			.on("zoom", redraw);
	/**
	 * Sets the margin based on screen size
	 */
	this.setMargins = function () {
		margin = {top: 20, right: 20, bottom: 30, left: 50},
			width = 0.99 * window.innerWidth - margin.left - margin.right,
			height = 0.9 * window.innerHeight - margin.top - margin.bottom;
	}
	/**
	 * Sets the axis
	 */
	this.setAxis = function(){
		/*set scales*/
		x = techan.scale.financetime()
			.range([0, width]),
		y = d3.scale.linear()
			.range([height, 0]),
		/*set type*/
		candlestick = techan.plot.candlestick()
			.xScale(x)
			.yScale(y),
		/*build svg*/
		xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom"),
		yAxis = d3.svg.axis()
			.scale(y)
			.orient("left");
	}
	/**
	 * Create an SVG
	 */
	this.svg = function()	{
		svg = d3.select(cntId).append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		svg.append("clipPath")
				.attr("id", "clip")
			.append("rect")
				.attr("x", 0)
				.attr("y", y(1))
				.attr("width", width)
				.attr("height", y(0) - y(1));

		svg.append("g")
				.attr("class", "candlestick")
				.attr("clip-path", "url(#clip)");

		svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + height + ")");

		svg.append("g")
				.attr("class", "y axis")
			.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 6)
				.attr("dy", ".71em")
				.style("text-anchor", "end")
				.text("Price ($)");

		svg.append("rect")
				.attr("class", "pane")
				.attr("width", width)
				.attr("height", height)
				.call(zoom);
	}
	/**
	 * Draw the graph
	 * @param  {Object} ndata new data
	 * @return {}       
	 */
	this.draw = function(ndata)	{
		/*update data if needed*/
		data = ndata || data;
		/*clear container*/
		$(cntId).html('');
	
		/*set the stage for plot*/
		this.setMargins();
		this.setAxis();
		this.svg();

		/*add data*/
		var accessor = candlestick.accessor();
			x.domain(data.map(accessor.d));
			y.domain(techan.scale.plot.ohlc(data, accessor).domain());
			svg.select("g.candlestick").datum(data);

		/*draw first plot*/
		redraw();

		/*set zoom*/
		zoom.x(x.zoomable().clamp(false)).y(y);

		/*enable resize*/
		var self = this;
		window.onresize = function () {
			self.draw();
		}
	}
	/**
	 * redraws partials of the plot
	 * @return {} 
	 */
	function redraw() {
		svg.select("g.candlestick").call(candlestick);
		svg.select("g.x.axis").call(xAxis);
		svg.select("g.y.axis").call(yAxis);
	}
}