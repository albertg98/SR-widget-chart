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
		this.dataMappers = new Chart.DataMappers(this);
		this.indicators = new Chart.Indicators(this);
		this.plots = new Chart.Plots(this);
		
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
			if(!opt || !opt.style)	{opt.style = 'ohlc'};
			/*Styling*/
			this.scales.del('*').release('pre').release('post').init();
			this.series.del('*').release('pre').release('post').init(opt.style);
			this.axes.del('*').release('pre').release('post').init((opt&&opt.xlab)?opt.xlab:toptions.xlab);
			this.annotations.del('*').release('pre').release('post').init((opt&&opt.crosshair && opt.crosshair.col)?opt.crosshair.col:null);
			this.indicators.del('*').release('pre').release('post').init();
			this.plots.del('*').release('pre').release('post').init((opt&&opt.plots)?opt.plots:{});
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
				.attr("height", height + margins[0].top + margins[0].bottom)
				.style("background",(opt&&opt.background)?opt.background:null),
			focus = svg.append("g")
				.attr("class", "focus")
				.attr("transform", "translate(" + margins[0].left + "," + margins[0].top + ")")
				.style("stroke",(opt&&opt.stroke)?opt.stroke:null), 
			context = svg.append("g")
				.attr("class", "context")
				.attr("transform", "translate(" + margins[1].left + "," + margins[1].top + ")")
				.style("stroke",(opt&&opt.stroke)?opt.stroke:null);	
			/*styling*/
			data = ndata || data;
			me.scales.refresh();
			me.series.refresh();
			me.axes.refresh();
			me.annotations.refresh();
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
			toptions.col = toptions.col || (opt.stroke || null);
			me.title();
			/*color*/
			d3.selectAll('.axis path, .axis line').style('stroke',(opt&&opt.stroke)?opt.stroke:null);
			d3.selectAll('text').style('fill',(opt&&opt.stroke)?opt.stroke:null);
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
					.style("fill",options.col || null)
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
	var Series = Chart.Yo(function(chart, type, scales, loc){
		var scale 	= chart.scales.get,
			t = techan.plot[type]()
					.xScale(scale(scales[0]))
					.yScale(scale(scales[1])),
			loc = loc || "focus";
			chart.svg()[loc].select('.' + chart.id).remove();
		var svg = chart.svg()[loc].append("g")
				.attr("class", chart.id)
				.attr("clip-path", "url(#clip)");

			return [t, svg];				
	})

	Series.prototype.init = function (style) {
		/*Set defaults*/
		var scales 	= this.chart.scales.get,
			me 		= this,
			data 	= this.chart.data();
			[
				['main',
					[style, ['x','y'], false]
				],
				['volume',
					['volume', ['x', 'y-volume'], false]
				],
				['indicators',
					['close', ['x', 'y'], false]
				],
				['bottom',
					['close', ['x2', 'y2'], "context"]
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
	var Annotations = Chart.Yo(function(chart, axis, format, opt){	
		var t = techan.plot.axisannotation()
					.axis(chart.axes.get(axis))
					.format(format);
		if(opt)	{
			t = opt(t) || t;
		}
		return t;
	})

	Annotations.prototype.init = function (color) {
		var me 	 = this,
			dim  = this.chart.getDim();
			[
				['y-ohlc',['yAxis', d3.format('$,.2fs')
				]],
				['x-time',[
						'xAxis', function (time) {
							return d3.time.format('%Y-%m-%d')(new Date(time));
						}, function(t)	{
							return t.width(65).translate([0, dim.dim[1]]);
						}
					]
				],
				['x-time-2',[
						'xAxis', function (time) {
							return d3.time.format('%Y-%m-%d')(new Date(time));
						}
					]
				]
			].forEach(function(item){
				me.add.apply(this, item);
			});
		this.register('post', function(chart){
			var scale 		= chart.scales.get,
				annotations = {x:[],y:[]};
				for(anno in chart.annotations.get()){ 
					if(annotations[anno[0]]){
						annotations[anno[0]].push(chart.annotations.get(anno));
					}	else	{
						console.warn('Did use annotation `'+anno+'` because it involved an invalid name');
					}
				}
			var t = techan.plot.crosshair()
				.xScale(scale('x'))
				.yScale(scale('y'))
				.xAnnotation(annotations.x)
				.yAnnotation(annotations.y);
			
			chart.svg().focus.append('g')
				.attr("class", "crosshair")
				.call(t);
		});
		this.register('post', function(){
			d3.selectAll('.crosshair path.wire').style("stroke", color);
		});
		return this;
	};

	Chart.Annotations = Annotations

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
			['x-main',
				[
					['x', 'x2'],function(){
						return data.map(function(v){return new Date(v.date)})
					}	
				]
			],
			['y-main',
				[
					['y', 'y2'],function(){
						return techan.scale.plot.ohlc(data, series('main')[0].accessor()).domain()
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
			data 		= chart.data(),
			zoomable 	= [scale('x').zoomable(), scale('x2').zoomable()];

			brush.x(zoomable[1].clamp(false));
			context.select("g.pane").call(brush).selectAll("rect").attr("height", dim.height2);
			scale('x').zoomable().domain(brush.empty() ? zoomable[1].domain() : brush.extent());
			
			var max = Math.max.apply(this, data.map(function(val){ 
			   return Math.max(val.close,val.open,val.high,val.low);
			}));
			var min = Math.min.apply(this, data.map(function(val){ 
			   return Math.min(val.close,val.open,val.high,val.low);
			}));
			scale('y').domain([min, max]);
			
			chart.plots.refresh();

			focus.select("g.x.axis").call(axis('xAxis'));
			context.select("g.x.axis").call(axis('xAxis2'));
			focus.select("g.y.axis").call(axis('yAxis'));

			chart.indicators.refresh();	
	};
	Chart.DataMappers = DataMappers;
//-----------------------------------------
//	Plots
//-----------------------------------------
	var Plots = Chart.Yo(function(chart, series, data, col){
		if(data.constructor === Function){
			data = data();
		}
		return chart.series.get(series)[1].datum(data)
			.call(chart.series.get(series)[0])
			.style('stroke',col)
			.select('.line')
			.style('stroke',col);
	});
	Plots.prototype.init = function(opt) {
		var data = this.chart.data(),
			me 	= this;
		[
			['main', ['main', this.chart.data, , (opt.main && opt.main.col)?opt.main.col:null]],
			['volume', ['volume', this.chart.data, (opt.volume && opt.volume.col)?opt.volume.col:null]],
			['bottom', ['bottom', this.chart.data, (opt.bottom && opt.bottom.col)?opt.bottom.col:null]]
		].forEach(function(item){
			me.add.apply(this, item);
		});
		return this;
	};
	Chart.Plots = Plots;
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

