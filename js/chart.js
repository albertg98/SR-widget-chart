function Chart (cntid) {

	var self = this;

	var margin, margin2, width, height, height2;
	/**
	 * Set Margins based on page height
	 * @param {Object} dim dimesions of plot
	 */
	this.setMargins = function (dim) {
		margin = {top: 20, right: 20, bottom: 100, left: 50},
		width = dim.width  - margin.left - margin.right,
		height = dim.height  - margin.top - margin.bottom,
		margin2 = {top: height+margin.top, right: 20, bottom: 20, left: 50},
		height2 = dim.height - margin2.top - margin2.bottom;
	}

	var x, x2, y, y2, yVolume;

	/**
	 * Set the range of the plot
	 * @param {Object} dim dimesions of plot
	 */
	this.setRange = function (dim) {
		this.setMargins(dim);
		x = techan.scale.financetime()
			.range([0, width]);

		x2 = techan.scale.financetime()
				.range([0, width]);

		y = d3.scale.linear()
				.range([height, 0]);

		yVolume = d3.scale.linear()
				.range([y(0), y(0.3)]);

		y2 = d3.scale.linear()
				.range([height2, 0]);
	}

	/*Set zoom*/
	var brush = d3.svg.brush()
			.on("brushend", draw);

	var candlestick, volume, close, accessor;
	/**
	 * set the seriese
	 * @param {Object} dim dimesions of plot
	 */
	this.setSeries = function (dim) {
		this.setRange(dim)
		candlestick = techan.plot.candlestick()
			.xScale(x)
			.yScale(y);

		volume = techan.plot.volume()
			.xScale(x)
			.yScale(yVolume);

		close = techan.plot.close()
			.xScale(x2)
			.yScale(y2);
		accessor = candlestick.accessor();
	}

	var xAxis, xAxis2, yAxis, yAxis2;
	/**
	 * set the axis
	 * @param {Object} dim dimesions of plot
	 */
	this.setAxis = function(dim){
		this.setSeries(dim);
		xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom");

		xAxis2 = d3.svg.axis()
			.scale(x2)
			.orient("bottom");

		yAxis = d3.svg.axis()
			.scale(y)
			.orient("left");

		yAxis2 = d3.svg.axis()
			.scale(y2)
			.ticks(0)
			.orient("left");
	}

	var ohlcAnnotation, timeAnnotation, crosshair;
	this.setAnnotation = function () {
		ohlcAnnotation = techan.plot.axisannotation()
			.axis(yAxis)
			.format(d3.format('$,.2fs'));

		timeAnnotation = techan.plot.axisannotation()
			.axis(xAxis)
			.format(function (time) {
				return d3.time.format('%Y-%m-%d')(new Date(time));
			})
			.width(65)
			.translate([0, height]);

		crosshair = techan.plot.crosshair()
			.xScale(x)
			.yScale(y)
			.xAnnotation(timeAnnotation)
			.yAnnotation(ohlcAnnotation);
	}

	var svg, focus;
	this.setSVG = function () {
		svg = d3.select(cntid).append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom);

		focus = svg.append("g")
			.attr("class", "focus")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	}

	/**
	 * draws the focus
	 * @param {Object} dim dimesions of plot
	 */
	this.drawFocus = function (dim) {
		/*Create Req*/
		this.setAxis(dim);
		this.setAnnotation();
		this.setSVG();
		
		focus.append("clipPath")
			.attr("id", "clip")
		.append("rect")
			.attr("x", 0)
			.attr("y", y(1))
			.attr("width", width)
			.attr("height", y(0) - y(1));

		focus.append("g")
				.attr("class", "volume")
				.attr("clip-path", "url(#clip)");

		focus.append("g")
				.attr("class", "candlestick")
				.attr("clip-path", "url(#clip)");

		focus.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + height + ")");

		focus.append("g")
				.attr("class", "y axis")
			.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 6)
				.attr("dy", ".71em")
				.style("text-anchor", "end")
				.text("Price ($)");

		focus.append('g')
				.attr("class", "crosshair")
				.call(crosshair);
	}

	var context;
	this.setContext = function() {
		context = svg.append("g")
			.attr("class", "context")
			.attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");
	}

	this.drawContext = function () {
		this.setContext();
		context.append("g")
			.attr("class", "close");

		context.append("g")
				.attr("class", "pane");

		context.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + height2 + ")");

		context.append("g")
				.attr("class", "y axis")
				.call(yAxis2);
	}

	/**
	 * Initilize plot
	 * @param {Object} dim dimesions of plot
	 * @return {Promise}    
	 */
	function init(dim) {
		$(cntid).html('');
		return new Promise(function(res, rej){
			self.drawFocus(dim);
			self.drawContext();
			res(null);
		});
	}
	var zoomable, zoomable2, data, dim;
	/**
	 * Main drawing function
	 * @param  {Object} dim   dimesions of plot
	 * @param  {Object} ndata new data to replace old
	 * @return {Promise}       
	 */
	this.draw = function (dim, ndata) {
		dim = dim || {height: window.innerHeight, width: window.innerWidth};
		data = ndata || data;
		return init(dim).then(plot);
	}
	/** Draws plot with current data **/
	function draw() {
		var candlestickSelection = focus.select("g.candlestick"),
			data = candlestickSelection.datum();
		zoomable.domain(brush.empty() ? zoomable2.domain() : brush.extent());
		y.domain(techan.scale.plot.ohlc(data.slice.apply(data, zoomable.domain()), candlestick.accessor()).domain());
		candlestickSelection.call(candlestick);
		focus.select("g.volume").call(volume);
		focus.select("g.x.axis").call(xAxis);
		focus.select("g.y.axis").call(yAxis);
		if(topt) {
			if(topt.sizemod) {topt.options.size = topt.sizemod*width};
			self.title(topt.title, topt.options);
		}
		(Object.keys(indtrs.fcn).length>0)&&(async.each(Object.keys(indtrs.fcn),function(key){indtrs.fcn[key]()}));
	}
	/** Draws and Maps data to plot **/
	function plot () {
		x.domain(data.map(accessor.d));
		x2.domain(x.domain());
		y.domain(techan.scale.plot.ohlc(data, accessor).domain());
		y2.domain(y.domain());
		yVolume.domain(techan.scale.plot.volume(data).domain());

		focus.select("g.candlestick").datum(data);
		focus.select("g.volume").datum(data);

		context.select("g.close").datum(data).call(close);
		context.select("g.x.axis").call(xAxis2);

		zoomable = x.zoomable();
		zoomable2 = x2.zoomable();
		brush.x(zoomable2);
		context.select("g.pane").call(brush).selectAll("rect").attr("height", height2);

		draw();

		window.onresize = function () {
			self.draw();
			if(Object.keys(indtrs.memo).length>0){
				indtrs.fcn = {};
				async.each(Object.keys(indtrs.memo), function(key){
					indtrs.memo[key]();
				});
			}
		}
		return self;
	}
	/**
	 * Redraws a new plot with the same dimension but new data
	 * @param  {Object} ndata new data
	 * @return {Promise}       
	 */
	this.redraw = function (ndata) {
		return this.draw(dim, ndata);
	}
	var topt;
	/**
	 * adds a title
	 * @param  {String} title   
	 * @param  {Object} options
	 */
	this.title = function (title, options) {
		options = options || {};
		if(title) {
			if(!options.size) options.size = 0.05*width;
				topt = {title:title, options:options};
			if(options.sizemod) { topt.sizemod = (options.size/width) };
			$('#ticker-text').html('');
			svg.append("text")
				.attr("id", "ticker-text")
				.attr("x", options.x || (width / 2))             
				.attr("y", options.y || (4/3)*parseInt(options.size))
				.attr("text-anchor", "middle")  
				.style("font-size",  parseInt(options.size)+"px") 
				.text(title);
		};
	}
	//-----------------------------------------
	//	Indicators
	//-----------------------------------------
	var indtrs = {memo:{},fcn:{}};
	/**
	 * Add Moving Avergae
	 * @param  {Number} n periods
	 * @param {Color} col 
	 * @return {String} the id of the SMA plot
	 */
	this.addMA = function(n, col, type)	{
		n = n || 10;
		col = col || 'green';
		type = type || 'sma';
		var id = type + '-' + n + '-' + col;
		console.log('MA-add', n, col, type);
		if(!(indtrs.fcn[id]&&indtrs.memo[id])&&($.inArray(type,['sma','ema'])>=0))	{
			console.log('MA-add', n, col, type);
			var tma = techan.plot[type]()
				.xScale(x2)
				.yScale(y);
			var g = svg.append("g")
				.attr("class", "indicator " + type + " ma-0")
				.attr("clip-path", "url(#clip)");
			g.datum(techan.indicator[type]()
				.period(n)(data)).call(tma);
			g.select('path')
				.style('stroke',col);
			indtrs.fcn[id] = function(){
				svg.select("g." + type + ".ma-0").call(tma.refresh);
			};
			indtrs.memo[id] = function() {
				self.addMA(n, col);
			};
		}
		console.log(indtrs);
		return id;
	};

	/**
	 * Clears indicators
	 * @param  {String} id
	 */
	this.clearInd = function(id)	{
		console.log('deleting...',id);
		if(id === '*') {
			indtrs = {memo:{},fcn:{}};
			this.redraw();
		}	else	{
			console.log('deleting...',id);
			try{
				console.log('deleting...',id);
				delete indtrs.memo[id];
				delete indtrs.fcn[id];
				this.redraw();
			}catch(e){
				console.warn('Tried to delete a non-existing indicator', id);
			}
		};
	};

}