/*Extend d3.scales*/
for (var scale in d3.scale) { techan.scale[scale] = d3.scale[scale]; }
(function(techan){
//-----------------------------------------
//	Chart Class
//-----------------------------------------
	function Chart (cntid, dim, data) {
		/*Dimensions*/
		var margins, width, height2, height, d;
		/**
		 * Set dimensions
		 */
		function setDim() {
			if(dim.constructor === jQuery)	{
				d  = {
					height: Math.max(dim.outerHeight(),dim.innerHeight(),dim.height()),
					width: Math.max(dim.outerWidth(),dim.innerWidth(),dim.width())
				}
			}	else	if(dim.constructor === Function)	{
				d = dim();
			}	else	{
				d = dim;
			}
			margins = [
				{top: 20, right: 20, bottom: 100, left: 50}
			];
			width = d.width  - margins[0].left - margins[0].right;
			height = d.height  - margins[0].top - margins[0].bottom; 
			margins.push({
				top: height+margins[0].top, 
				right: 20, bottom: 20, left: 50
			});
			height2 = d.height - margins[1].top - margins[1].bottom;
		};
		/**
		 * Get dimenstions
		 * @return {Object} 
		 */
		this.getDim = function()	{
			return {
				margins : margins,
				dim 	: [width, height],
				height2	: height2
			};
		};
		setDim();
		/*SVG*/
		var svg, focus, context;
		
		var	svg = d3.select(cntid).append("svg")
			.attr("width", width + margins[0].left + margins[0].right)
			.attr("height", height + margins[0].top + margins[0].bottom),

			focus = svg.append("g")
			.attr("class", "focus")
			.attr("transform", "translate(" + margins[0].left + "," + margins[0].top + ")"), 
			
			context = svg.append("g")
			.attr("class", "context")
			.attr("transform", "translate(" + margins[1].left + "," + margins[1].top + ")");	
		
		/**
		 * Returns SVGs
		 * @return {Object} 
		 */
		this.svg = function(){return {
			svg: svg, focus: focus, context: context
		}};

		/*Set*/
		this.scales = new Chart.Scales(this);
		this.series = new Chart.Series(this);
		this.axes = new Chart.Axes(this);
		this.annotations = new Chart.Annotations(this);
		this.crosshairs = new Chart.Crosshairs(this);
		this.dataMappers = new Chart.DataMappers(this);
		this.indicators = new Chart.Indicators(this);
		
		/*Data*/
		var data = data || [];
		this.data = function()	{
			return data;
		}
		var nextdata;
		this.next = function(fcn)	{
			nextdata = fcn(nextdata) || nextdata;
			return this;
		}
		/*Initilization*/
		this.init = function(ndata, opt)	{
			/*Styling*/
			this.scales.del('*').release('pre').release('post').init();
			this.series.del('*').release('pre').release('post').init();
			this.axes.del('*').release('pre').release('post').init((opt&&opt.xlab)?opt.xlab:toptions.xlab);
			this.annotations.del('*').release('pre').release('post').init();
			this.crosshairs.del('*').release('pre').release('post').init();
			this.indicators.del('*').release('pre').release('post').init();
			/*data*/
			data = ndata || data;
			this.dataMappers.init();
			/*title*/
			this.refresh(data, opt);
			return this;
		}
		var me = this;
		this.refresh = function(ndata, opt)	{
			/*empty old*/
			d3.select(cntid).html("");
			/*Rebuild*/
			setDim();
			svg = d3.select(cntid).append("svg")
				.attr("width", width + margins[0].left + margins[0].right)
				.attr("height", height + margins[0].top + margins[0].bottom),
			focus = svg.append("g")
				.attr("class", "focus")
				.attr("transform", "translate(" + margins[0].left + "," + margins[0].top + ")"), 
			context = svg.append("g")
				.attr("class", "context")
				.attr("transform", "translate(" + margins[1].left + "," + margins[1].top + ")");	
			/*styling*/
			data = ndata || data;
			me.scales.refresh();
			me.series.refresh();
			me.axes.refresh();
			me.annotations.refresh();
			me.crosshairs.refresh();
			me.dataMappers.refresh();
			me.indicators.refresh();
			/*title*/
			if(opt&&opt.title)	{
				if(opt.title.constructor === String)	{
					toptions.text = opt.title;
				}	else	if(opt.title.constructor === Object && opt.title.text){
					toptions = opt.title;
				}
			};
			me.title();
			return this;
		}
		
		window.onresize = function()	{
			me.refresh();
		}
		/**
		 * adds a title
		 * @param  {String} title   
		 * @param  {Object} options
		 */
		var toptions = {text:false, options:{}, xlab:"Price ($)"};
		this.title = function (title, options) {
			options = options || toptions.options;
			title = title || toptions.text;
			if(title) {
				toptions = {text: title, options: options};
				if(!options.size) options.size = 0.02*width;
					topt = {title:title, options:options};
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
	}

//-----------------------------------------
//	Yotzer - Process Maintainer
//-----------------------------------------
	function Yotzer (fcn)	{
		var cnt = {}, events = {pre:[],main:{},post:[]};
		return function (ctx)	{
			this.chart = ctx;
			this.events = function(){
				return events;
			};
			/**
			 * Add to que of events
			 * @param {String} id   
			 * @param {Array} args 
			 * @return {this} 
			 */
			this.add = function(id, args)	{
				events.main[id] = function()	{
					ctx.id = id;
					cnt[id] = fcn.apply(this, [ctx].concat(args));
				};
				return this;
			}
			/**
			 * Register events
			 * @param  {String} time 
			 * @param  {Function} fcn  
			 * @return {this}      
			 */
			this.register = function(time, fcn){
				events[time].push(fcn);
				return this;
			}
			this.release = function(time)	{
				events[time] = [];
				return this;
			}
			/**
			 * Refresh events
			 * @return {this} 
			 */
			this.refresh = function() {
				cnt = {};
				events.pre.forEach(function(fcn){
					fcn(ctx);
				});
				Object.keys(events.main).forEach(function(fcname){
					events.main[fcname]();
				});
				events.post.forEach(function(fcn){
					fcn(ctx);
				});
				return this;
			}
			/**
			 * Get a previous process
			 * @param  {String} id 
			 * @return {Any}    
			 */
			this.get = function(id)	{
				if(id){
					return cnt[id]
				}	else	{
					return cnt;
				}
			}
			/**
			 * Delete a process
			 * @param  {String} id 
			 * @return {this}    
			 */
			this.del = function(id)	{
				if(id === '*'){
					events.main = {};
				}	else	{
					delete events.main[id];
				};
				return this;
			}
			/**
			 * Set a Promise
			 */
			var data;
			this.next = function(fcn)	{
				data = fcn(data);
				return this;
			}
		};
	}

	Chart.Yo = Yotzer;

//-----------------------------------------
//	Scales - Scale Maker 
//-----------------------------------------
	/**
	 * @param  {this} ctx                             
	 * @param  {d3 scale} scale                           
	 * @param  {Array|Function} sizes     [height, width]
	 * @return {Sclae}                                 
	 */
	var Scales = Chart.Yo(function(ctx, scale, sizes){
		if(sizes.constructor === Function)	{
			sizes = sizes();
		}
		return techan.scale[scale]().range(sizes);
	})

	Scales.prototype.init = function () {
		/*Get margins*/
		var dim  	= this.chart.getDim,
			me 	 	= this,
			scales 	= this.get,
			focus	= this.chart.svg().focus;
		/*Set Defaults*/
		[
			['x', [
					'financetime',
					function()	{
						return [0,dim().dim[0]];
					}
				]
			],
			['x2', [
					'financetime',
					function(){
						return [0,dim().dim[0]];
					}
				]
			],
			['y', [
					'linear',
					function(){
						return [dim().dim[1],0];
					}
				]
			],
			['y2', [
					'linear',
					function(){
						return [dim().height2,0];
					}
				]
			]
		].forEach(function(item){
			me.add.apply(this, item);
		});
		this.add('y-volume', ['linear',
			function(){
				return [scales('y')(0), scales('y')(0.3)];
			}
		]);
		/*Register post-process function*/
		this.register('post', function(ctx)	{
			var focus 	= ctx.svg().focus,
				y 	  	= ctx.scales.get('y'),
				dim 	= ctx.getDim;
			focus.append("clipPath")
				.attr("id", "clip")
			.append("rect")
				.attr("x", 0)
				.attr("y", y(1))
				.attr("width", dim().dim[0])
				.attr("height", y(0) - y(1));
		});
		return this
	};
	Chart.Scales = Scales;

//-----------------------------------------
//	Series - Series Maker
//-----------------------------------------
	/**
	 * @param  {this} ctx                              
	 * @param  {String} type                             
	 * @param  {Array|Function} scales  Array of Scales
	 * @return {Series}                                  
	 */
	var Series = Chart.Yo(function(ctx, type, scales, fcn, loc, data){
		if(scales.constructor === Function)	{
			scales = scales();
		}
		var t = techan.plot[type]()
					.xScale(scales[0])
					.yScale(scales[1]),
			loc = loc || "focus",
			svg = ctx.svg()[loc].append("g")
				.attr("class", ctx.id);

			if(data) {svg.datum(data)};
			
			if(fcn) {
				svg = fcn(svg);
			}
			return [t, svg, [ctx, type, scales, fcn, loc, data]];				
	})

	Series.prototype.init = function () {
		/*Set defaults*/
		var scales 	= this.chart.scales.get,
			me 		= this;
			[
				['candlestick',
					['candlestick', function(){
						return [scales('x'), scales('y')];
					}, function(svg){
						return svg.attr("clip-path", "url(#clip)");
					}]
				],
				['volume',
					['volume', function(){
						return [scales('x'), scales('y-volume')];
					}, function(svg){
						return svg.attr("clip-path", "url(#clip)");
					}]
				],
				['indicators',
					['close', function(){
						return [scales('x'), scales('y')];
					}, function(svg){
						return svg.attr("clip-path", "url(#clip)");
					}]
				],
				['close',
					['close', function(){
						return [scales('x2'), scales('y2')];
					}, false, "context"]
				]
			].forEach(function(item){
				me.add.apply(this, item);
			});	
		this.register('pre', function(ctx){
			ctx.svg().context.append("g")
				.attr("class", "pane");
		});
		return this;
	};

	Chart.Series = Series

//-----------------------------------------
//	Axes -  Axis Maker
//-----------------------------------------
	/**
	 * @param  {this} ctx                          
	 * @param  {Scale} scale                        
	 * @param  {String} orient                       
	 * @param  {Array} opt
	 * @return {Axis}                              
	 */
	var Axes = Chart.Yo(function(ctx, scale, orient, opt){
		if(scale.constructor === Function)	{
			scale = scale();
		}	
		var t = d3.svg.axis()
					.scale(scale)
					.orient(orient);
		if(opt)	{
			opt.forEach(function(fcn){
				t = fcn(t);
			})
		}
		return t;
	})

	Axes.prototype.init = function (xtitle) {
		/*Set Defaults*/
		var me 		= this,
			scales 	= this.chart.scales.get;

		[
			['xAxis',
				[function(){
					return scales('x');
				}, "bottom"]
			],
			['xAxis2',
				[function(){
					return scales('x2');
				}, "bottom"]
			],
			['yAxis',
				[function(){
					return scales('y');
				}, "left"]
			],
			['yAxis2',
				[function(){
					return scales('y2');
				}, "left", [
					function(t)	{
						return t.ticks(0);
					}
				]]
			]
		].forEach(function(item){
			me.add.apply(this, item);
		});	
		this.register('post', function(chart){
			var	focus	= chart.svg().focus,
				context	= chart.svg().context,
				dim  	= chart.getDim(),
				axis 	= chart.axes.get;

			focus.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + dim.dim[1] + ")");
			focus.append("g")
				.attr("class", "y axis")
			.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 6)
				.attr("dy", ".71em")
				.style("text-anchor", "end")
				.text(xtitle);
			context.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + dim.height2 + ")");
			context.append("g")
					.attr("class", "y axis")
					.call(axis('yAxis2'));
		});
		return this;
	};
	Chart.Axes = Axes	

//-----------------------------------------
//	Annotation
//-----------------------------------------
	var Annotations = Chart.Yo(function(ctx, axis, format, opt){
		if(axis.constructor === Function)	{
			axis = axis();
		}	
		var t = techan.plot.axisannotation()
					.axis(axis)
					.format(format);
		if(opt)	{
			opt.forEach(function(fcn){
				t = fcn(t);
			})
		}
		return t;
	})

	Annotations.prototype.init = function () {
		var me 	 = this,
			dim  = this.chart.getDim()
			axis = this.chart.axes.get;
			[
				['ohlc',
					function(){
						return axis('yAxis');
					}, d3.format('$,.2fs')
				],
				['time',
					function(){
						return axis('xAxis');
					}, function (time) {
						return d3.time.format('%Y-%m-%d')(new Date(time));
					}, [
						function(t)	{
							return t.width(65).translate([0, dim.dim[1]]);
						}
					]
				]
			].forEach(function(item){
				me.add.apply(this, item);
			});
		return this;
	};

	Chart.Annotations = Annotations

//-----------------------------------------
//	Crosshair
//-----------------------------------------
	var Crosshairs = Chart.Yo(function(ctx, scales, annotations){
		if(scales.constructor === Function)	{
			scales = scales();
		}	
		if(annotations.constructor === Function)	{
			annotations = annotations();
		}	
		var t = techan.plot.crosshair()
				.xScale(scales[0])
				.yScale(scales[1])
				.xAnnotation(annotations[0])
				.yAnnotation(annotations[1]);
			
		ctx.svg().focus.append('g')
			.attr("class", "crosshair")
			.call(t);
		return t;
	})

	Crosshairs.prototype.init = function () {
		var me 			= this,
			scale 		= this.chart.scales.get,
			annotation 	= this.chart.annotations.get;
			[
				['crosshair',
					[
						function(){
							return [scale('x'), scale('y')];
						},
						function(){
							return [annotation('time'), annotation('ohlc')];
						}
					]
				]
			].forEach(function(item){
				me.add.apply(this, item);
			});
		return this;
	};

	Chart.Crosshairs = Crosshairs;

//-----------------------------------------
//	DataMapper
//-----------------------------------------
	var DataMappers = Chart.Yo(function(ctx, scales, domain){
		if(domain.constructor === Function)	{
			domain = domain();
		}
		scales.forEach(function(scale){
			ctx.scales.get(scale).domain(domain);
		});
		return domain;
	});

	DataMappers.prototype.init = function () {
		var me 			= this,
			data 		= this.chart.data(),
			series 	= this.chart.series.get;
		[
			['x-dom',
				[
					['x', 'x2'],function(){
						return data.map(function(v){return new Date(series('candlestick')[0].accessor().d(v))})
					}	
				]
			],
			['y-dom',
				[
					['y', 'y2'],function(){
						return techan.scale.plot.ohlc(data, series('candlestick')[0].accessor()).domain()
					}
				]
			],
			['y-volume',
				[
					['y-volume'],
					techan.scale.plot.volume(data).domain()
				]
			]
		].forEach(function(item){
			me.add.apply(this, item);
		});
		this.register('post', function(){
			me.svg();
			me.draw(me.chart, me.brush());
		});
		return this;
	};
	DataMappers.prototype.svg = function()	{
		var data 	= this.chart.data(),
			focus	= this.chart.svg().focus,
			context	= this.chart.svg().context,
			series 	= this.chart.series.get,
			axis 	= this.chart.axes.get;

		focus.select("g.candlestick").datum(data);
		focus.select("g.volume").datum(data);

		context.select("g.close").datum(data).call(series('close')[0]);
		context.select("g.x.axis").call(axis('xAxis2'));
	};
	DataMappers.prototype.brush = function() {
		if(!this.__brush)	{
			var me = this;
			this.__brush = d3.svg.brush().on("brushend", function(){
				me.draw(me.chart, me.brush());
			});
		};
		return this.__brush;
	};
	DataMappers.prototype.draw = function(chart, brush) {
		var focus		= chart.svg().focus,
			context		= chart.svg().context,
			dim  		= chart.getDim(),
			series  	= chart.series.get,
			scale  		= chart.scales.get,
			axis  		= chart.axes.get,
			brush		= brush,
			csSel		= focus.select("g.candlestick"),
			data 		= csSel.datum(),
			indicators 	= chart.indicators.refresh,
			zoomable 	= [scale('x').zoomable(), scale('x2').zoomable()];
			
			brush.x(zoomable[1]);
			context.select("g.pane").call(brush).selectAll("rect").attr("height", dim.height2);
			zoomable[0].domain(brush.empty() ? zoomable[1].domain() : brush.extent());
			scale('y').domain(techan.scale.plot.ohlc(data.slice.apply(data, zoomable[0].domain()), series('candlestick')[0].accessor()).domain());
			csSel.call(series('candlestick')[0]);
			indicators();
			// focus.select("g.volume").call(series('volume')[0]);
			focus.select("g.x.axis").call(axis('xAxis'));
			focus.select("g.y.axis").call(axis('yAxis'));
				
	};
	Chart.DataMappers = DataMappers;

//-----------------------------------------
//	Indicators
//-----------------------------------------
	var Indicators = Chart.Yo(function(ctx, type, color, period){
		period = period || 10;
		color = color || getRandomColor();
		type = type || 'sma';
		type = type.toLowerCase();
		var tma = techan.plot[type]()
				.xScale(ctx.scales.get('x'))
				.yScale(ctx.scales.get('y')),
			g = d3.select('.indicators').append("g")
			.attr("class", "indicator " + type + " ma-0")
			.attr("clip-path", "url(#clip)");
		g.datum(techan.indicator[type]()
			.period(period)(ctx.data())).call(tma);
		g.select('path')
			.style('stroke',color);
		return [g, tma];
	});

	Indicators.prototype.init = function () {
		this.register('pre', function(chart){
			d3.select('.indicators').html('');
		});
		return this;
	};
	Chart.Indicators = Indicators;

//-----------------------------------------
//	End
//-----------------------------------------
	techan.Chart = Chart;
})(techan);

