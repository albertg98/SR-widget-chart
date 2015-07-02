/*Extend d3.scales*/
for (var scale in d3.scale) { techan.scale[scale] = d3.scale[scale]; }
(function(techan){
//-----------------------------------------
//	Chart Class
//-----------------------------------------
	function Chart (cntid, dim, data) {
		/*Error Handling*/
		Chart.assert(d3.select(cntid)[0].length > 0 , "Can\'t make chart on non-existing container!");
		Chart.check(dim, Object, "dimensions", "new Chart()");
		(data)&&Chart.check(data, Array, "data", "new Chart()");
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
		this.axes = new Chart.Axes(this);
		this.crosshair = new Chart.Crosshair(this);
		this.supstances = new Chart.Supstances(this);
		this.trendlines = new Chart.Trendlines(this);
		this.dataMappers = new Chart.DataMappers(this);
		this.indicators = new Chart.Indicators(this);
		this.plots = new Chart.Plots(this);
		
		/*Data*/
		var data = data || [];
		this.data = function()	{
			return data;
		}
		/*Create a promise*/
		var nextdata;
		this.next = function(fcn)	{
			nextdata = fcn(nextdata) || nextdata;
			return this;
		}
		var me = this;
		/**
		 * Initialize plot
		 * @param  {Object} ndata new data
		 * @param  {Object} opt   
		 * @return {this}       
		 */
		this.init = function(ndata, opt)	{
			/*set defaults*/
			if(!opt)	{opt = {}};
			if(!opt.style)	{opt.style = 'ohlc'};
			if(!opt.hasOwnProperty('refresh')) {opt.refresh = true};
			/*Error handling*/
			ndata&&Chart.check(ndata, Array, "new data", "chart.init");
			Chart.check(opt, Object, "options", "chart.init");
			/*Styling*/
			this.scales.del('*').release('pre').release('post').init();
			this.axes.del('*').release('pre').release('post').init((opt&&opt.xlab)?opt.xlab:toptions.xlab);
			this.crosshair.del('*').release('pre').release('post').init((opt&&opt.crosshair && opt.crosshair.col)?opt.crosshair.col:null);
			this.supstances.del('*').release('pre').release('post').init();
			this.trendlines.del('*').release('pre').release('post').init();
			this.indicators.del('*').release('pre').release('post').init();
			this.plots.del('*').release('pre').release('post').init((opt&&opt.plots)?opt.plots:{});
			/*data*/
			data = ndata || data;
			this.dataMappers.init();
			/*title*/
			this.refresh(data, opt);
			/*set resizing event*/
			if(opt.refresh)	{
				window.onresize = function()	{
					me.refresh();
				}
			};
			return this;
		}
		
		/**
		 * Refreshes the plot
		 * @param  {Object} ndata new data
		 * @param  {Object} opt   
		 * @return {this}       
		 */
		this.refresh = function(ndata, opt)	{
			/*Error handling*/
			ndata&&Chart.check(ndata, Array, "new data", "chart.init");
			Chart.check(opt, Object, "options", "chart.init");
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
			me.axes.refresh();
			me.crosshair.refresh();
			me.dataMappers.refresh();
			me.indicators.refresh();
			me.supstances.refresh();
			// me.trendlines.refresh();
			/*title*/
			if(opt&&opt.title)	{
				if(opt.title.constructor === String)	{
					toptions.text = opt.title;
				}	else	if(opt.title.constructor === Object && opt.title.text){
					toptions = opt.title;
				}
			};
			toptions.col = toptions.col || ((opt&&opt.stroke)?opt.stroke:null);
			me.title();
			/*color*/
			d3.selectAll('.axis path, .axis line').style('stroke',(opt&&opt.stroke)?opt.stroke:null);
			d3.selectAll('text').style('fill',(opt&&opt.stroke)?opt.stroke:null);
			return this;
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
			/*Error handling*/
			Chart.check(title, String, "title-text","chart.title");
			Chart.check(options, Object, "title-options", "chart.title")
			/*If there is a title*/
			if(title) {
				toptions = {text: title, options: options};
				if(!options.size) options.size = 0.02*width;
					topt = {title:title, options:options};
				/*clear old title*/
				svg.select('#ticker-text').remove();
				/*Make title*/
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

		this.highlow = function()	{
			return Chart.highlow(this.data());
		}
	}
//-----------------------------------------
//	Error Handlers
//-----------------------------------------
	Chart.assert = function(assertion, msg)	{
		if(!assertion)	{
			throw new Error(msg);
		}
	}
	Chart.check = function(obj, type, name, fcn)	{
		Chart.assert(type, "Wrong " + name + " passed into " + fcn + " must be of `" + type.name + "` class.");
	}
//-----------------------------------------
//	Math methods
//-----------------------------------------
	Chart.highlow = function(data, type)	{
		type = type || '*';
		var max = Math.max.apply(this, data.map(function(val){
			if(type === '*')	{ 
				return Math.max(val.close,val.open,val.high,val.low);
			}	else	{
				return val[type];
			}
		}));
		var min = Math.min.apply(this, data.map(function(val){ 
			if(type === '*')	{
				return Math.min(val.close,val.open,val.high,val.low);
			}	else	{
				return val[type];
			}
		}));
		return [min, max];
	}
	Chart.hlmean = function(data)	{
		return Chart.highlow(data).reduce(function(pv, cv) { return pv + cv; }, 0)/2;
	}
	var pmima = [0,100];
	Chart.precent = function(val, min, max)	{
		pmima[0] = min || pmima[0];
		pmima[1] = max || pmima[1];
		return (val-pmima[0])/(pmima[1]-pmima[0]);
	}
	Chart.findCloset = function(dat, num)	{
		return dat.reduce(function(d,b){
			if(Math.abs(d.value - num)>Math.abs(b.value - num)) {
				return b
			}	else	{
				return d
			};
		});
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
			this.getA = function(id){
				if(id){
					return cnt[id]
				}	else	{
					return Object.keys(cnt).map(function(name){ return cnt[name]});
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
			['x-bottom', [
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
			['y-%', [
					'linear',
					function(){
						return [dim().dim[1],0];
					}
				]
			],
			['y-bottom', [
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
				return [scales('y')(0), scales('y')(0.4)];
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
		var t = d3.svg.axis()
					.scale(ctx.scales.get(scale))
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
		var me 		= this;
		[
			['xAxis',
				['x', "bottom"]
			],
			['xAxis2',
				['x-bottom', "bottom"]
			],
			['%Axis',
				['y-%', "right"]
			],
			['yAxis',
				['y', "left"]
			],
			['yAxis2',
				['y-bottom', "left", [
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
//	Crosshair
//-----------------------------------------
	var Crosshair = Chart.Yo(function(chart, axis, format, opt){	
		var t = techan.plot.axisannotation()
					.axis(chart.axes.get(axis))
					.format(format);
		if(opt)	{
			t = opt(t) || t;
		}
		return t;
	})

	Crosshair.prototype.init = function (color) {
		var me 	 = this,
			dim  = this.chart.getDim();
			[
				['y-ohlc',['yAxis', d3.format('$,.2fs')
				]],
				['x-time',[
						'xAxis', function (time) {
							return new Date(time).toDateString();
						}, function(t)	{
							return t.width(65).translate([0, dim.dim[1]]);
						}
					]
				]
			].forEach(function(item){
				me.add.apply(this, item);
			});
		this.register('post', function(chart){
			var scale 		= chart.scales.get,
				annotations = {x:[],y:[]};
				for(anno in chart.crosshair.get()){ 
					if(annotations[anno[0]]){
						annotations[anno[0]].push(chart.crosshair.get(anno));
					}	else	{
						console.warn('Did use annotation `'+anno+'` because it involved an invalid name');
					}
				}
			var t = techan.plot.crosshair()
				.xScale(scale('x'))
				.yScale(scale('y'))
				.xAnnotation(annotations.x)
				.yAnnotation(annotations.y),
			
				cross = chart.svg().focus.append('g')
				.attr("class", "crosshair")
				.call(t)
				.on("click", function(d){
					if(chart.crosshair.onclick) {
						chart.crosshair.onclick($('.axisannotation.x text').html(), $('.axisannotation.y text').html())
					}
				})
				.on("dblclick", function(d){
					if(chart.crosshair.ondbclick) {
						chart.crosshair.ondbclick($('.axisannotation.x text').html(), $('.axisannotation.y text').html())
					}
				});
		});
		this.register('post', function(){
			d3.selectAll('.crosshair path.wire').style("stroke", color);
		});
		return this;
	};

	Chart.Crosshair = Crosshair
//-----------------------------------------
//	Special methods 
//-----------------------------------------
	function mouseEnter(valueText){
		return function(d) {
			valueText.style("display", "inline");
			valueText.text("Value: " + d3.format(',.2fs')(d.value));
		}
	}
	function mouseOut(valueText){
		return function () {
			valueText.style("display", "none");
		}
	}
	function drag(valueText, ctx){
		return function (d) {
			valueText.text("Value: " + d3.format(',.2fs')(d.value));
			if(ctx.ondrag){ ctx.ondrag(d.value||d, d.id); };
		}
	}
//-----------------------------------------
//	Supstances
//-----------------------------------------
	var Supstances = Chart.Yo(function(chart, value){
		if(value.constructor === Function)	{
			value = value();
		}	
		Chart.check(value, Number, "value", "chart.supstance");
		var mima = Chart.highlow(chart.data(), 'date');
		return { id: chart.id, start: new Date(mima[0]), end: new Date(mima[1]), value: value};
	});

	Supstances.prototype.init = function (color) {
		this.register('pre', function(chart){
			chart.svg().focus.selectAll('g.supstances').remove();
			chart.svg().focus.selectAll('text.supstances-coords').remove();
		});
		this.register('post', function(chart){
				var dim = chart.getDim(),
			/*Annotations*/
				axes = chart.axes.get,
				ohlc = techan.plot.axisannotation()
					.axis(axes('yAxis'))
					.format(d3.format(',.2fs')),

				percent = techan.plot.axisannotation()
					.axis(axes('%Axis'))
					.format(d3.format('+.1%')),
			/*Value text*/
				valueText = chart.svg().svg.append('text')
					.style("text-anchor", "end")
					.attr("class", "supstances-coords")
					.attr("x", dim.dim[0] - 5)
					.attr("y", 15),
			/*Supstance-render*/
				scales = chart.scales.get,
				supstance = techan.plot.supstance()
					.xScale(scales('x'))
					.yScale(scales('y'))
					.annotation([ohlc, percent])
					.on("mouseenter", mouseEnter(valueText))
					.on("mouseout", mouseOut(valueText))
					.on("drag", drag(valueText, chart.supstances));
			/*create supstance*/
				chart.svg().focus.append('g')
					.attr('class','supstances')
					.datum(chart.supstances.getA())
					.call(supstance).call(supstance.drag)
					.on("click", function(d){
						if(chart.supstances.onclick) {
							chart.supstances.onclick(Chart.findCloset(d, Number($('.supstances-coords')[$('.supstances-coords').length - 1].textContent.replace('Value: ',""))))
						}
					})
					.on("dblclick", function(d){
						var num = Number($('.supstances-coords')[$('.supstances-coords').length - 1].textContent.replace('Value: ',""));
						if(chart.supstances.ondbclick) {
							chart.supstances.ondbclick(Chart.findCloset(d, Number($('.supstances-coords')[$('.supstances-coords').length - 1].textContent.replace('Value: ',""))))
						}
					});
		});
		return this;
	};

	Chart.Supstances = Supstances
//-----------------------------------------
//	Trendlines
//-----------------------------------------
	var Trendlines = Chart.Yo(function(chart, values, dates){
		if(values.constructor === Function)	{
			values = values();
		}
		Chart.check(values, Array, "values", "chart.supstance");
		if(dates.constructor === Function)	{
			dates = dates();
		}
		Chart.check(dates, Array, "from-to (milliseconds)", "chart.supstance");
		console.log(values, dates);
		return { id: chart.id, 
			start: {
				date: new Date(dates[0]), 
				value: values[0]
			}, end: {
				date: new Date(dates[1]), 
				value: values[1]
			}
		};
	});

	Trendlines.prototype.init = function (color) {
		var me 	 = this,
			data = this.chart.data;
		// [
		// 	['test', [
		// 		function(){return Chart.highlow(data())},
		// 		function(){return Chart.highlow(data(),'date')}
		// 	]]
		// ].forEach(function(item){
		// 	me.add.apply(this, item);
		// });
		this.register('pre', function(chart){
			chart.svg().focus.selectAll('g.trendlines').remove();
			chart.svg().focus.selectAll('text.trendlines-coords').remove();
		});
		this.register('post', function(chart){
				var dim = chart.getDim(),
			/*Annotations*/
				axes = chart.axes.get,
				ohlc = techan.plot.axisannotation()
					.axis(axes('yAxis'))
					.format(d3.format(',.2fs')),

				percent = techan.plot.axisannotation()
					.axis(axes('%Axis'))
					.format(d3.format('+.1%')),
			/*Value text*/
				valueText = chart.svg().svg.append('text')
					.style("text-anchor", "end")
					.attr("class", "trendlines-coords")
					.attr("x", dim.dim[0] - 5)
					.attr("y", 15),
			/*Supstance-render*/
				scales = chart.scales.get,
				supstance = techan.plot.supstance()
					.xScale(scales('x'))
					.yScale(scales('y'))
					.annotation([ohlc, percent])
					.on("mouseenter", mouseEnter(valueText))
					.on("mouseout", mouseOut(valueText))
					.on("drag", drag(valueText, chart.trendlines));
			/*create supstance*/
				chart.svg().focus.append('g')
					.attr('class','supstances')
					.datum(chart.supstances.getA())
					.call(supstance).call(supstance.drag)
					.on("click", function(d){
						if(chart.supstances.onclick) {
							chart.supstances.onclick(Chart.findCloset(d, Number($('.supstances-coords')[$('.supstances-coords').length - 1].textContent.replace('Value: ',""))))
						}
					})
					.on("dblclick", function(d){
						var num = Number($('.supstances-coords')[$('.supstances-coords').length - 1].textContent.replace('Value: ',""));
						if(chart.supstances.ondbclick) {
							chart.supstances.ondbclick(Chart.findCloset(d, Number($('.supstances-coords')[$('.supstances-coords').length - 1].textContent.replace('Value: ',""))))
						}
					});
		});
		return this;
	};

	Chart.Trendlines = Trendlines
//-----------------------------------------
//	DataMapper
//-----------------------------------------
	var DataMappers = Chart.Yo(function(ctx, scales, domain){
		if(domain.constructor === Function)	{
			domain = domain();
		}
		scales.map(function(scale){
			return ctx.scales.get(scale).domain(domain);
		});
		return scales;
	});

	DataMappers.prototype.init = function () {
		var me 			= this,
			data 		= this.chart.data();
		[
			['x-main',
				[
					['x', 'x-bottom'],function(){
						return data.map(function(v){return new Date(v.date)});
					}	
				]
			],
			['y-main',
				[
					['y', 'y-bottom'],function(){
						return Chart.highlow(data);
					}
				]
			],
			['y-volume',
				[
					['y-volume'],function(){
						return Chart.highlow(data, 'volume');
					}
				]
			]
		].forEach(function(item){
			me.add.apply(this, item);
		});
		this.register('pre', function(ctx){
			ctx.svg().context.append("g")
				.attr("class", "pane");
			ctx.svg().focus.append("g")
				.attr("class", "pane");
		})
		this.register('post', function(){
			me.draw(me.chart, me.brush());
		});
		return this;
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
			scale  		= chart.scales.get,
			axis  		= chart.axes.get,
			brush		= brush,
			data 		= chart.data(),
			zoomable 	= [scale('x').zoomable(), scale('x-bottom').zoomable()];

			/*Zoom*/
			brush.x(zoomable[1]);
			context.select("g.pane")
				.call(brush)
				.selectAll("rect")
				.attr("height", dim.height2);
			scale('x').zoomable().domain(brush.empty() ? zoomable[1].domain() : brush.extent());
			
			/*Set Y-axis*/
			scale('y').domain(Chart.highlow(data));
			
			/*Build plots*/
			chart.plots.refresh();

			/*Create Axis*/
			focus.select("g.x.axis").call(axis('xAxis'));
			context.select("g.x.axis").call(axis('xAxis2'));
			focus.select("g.y.axis").call(axis('yAxis'));
			/*Call indicators*/
			chart.indicators.refresh();	
	};
	Chart.DataMappers = DataMappers;
//-----------------------------------------
//	Plots
//-----------------------------------------
	var Plots = Chart.Yo(function(chart, type, scales, loc, col, data){
		if(data.constructor === Function){
			data = data();
		}
		/*Check types*/
		(data)&&Chart.check(data , Array, "data", "chart.plot.add");
		Chart.check(scales, String, "scales", "chart.plot.add");
		Chart.check(loc, String, "loc", "chart.plot.add");
		Chart.check(col, String, "col", "chart.plot.add");
		Chart.check(type, String, "type", "chart.plot.add");
		/*Create plot*/
		var scale 	= chart.scales.get,
			t = techan.plot[type]()
					.xScale(scale(scales[0]))
					.yScale(scale(scales[1]));
		
		/*Clear container if it exists*/
			chart.svg()[loc].select('.' + chart.id + '-' + type).remove();
		/*Create svg*/
		var svg = chart.svg()[loc].append("g")
				.attr("class", chart.id + '-' + type)
				.attr("clip-path", "url(#clip)");
		/*Parse data*/
		if(data)	{
			svg.datum(data)
				.call(t)
				.style('stroke',col)
				.select('.line')
				.style('stroke',col);
		};
		return [svg,t];
	});
	Plots.prototype.init = function(opt) {
		var data = this.chart.data(),
			me 	= this;
		[
			['volume', ['volume', ['x', 'y-volume'], "focus", (opt.volume && opt.volume.col)?opt.volume.col:null, this.chart.data]],
			['main', [(opt.main && opt.main.style)?opt.main.style:'close', ['x','y'], "focus", (opt.main && opt.main.col)?opt.main.col:null, this.chart.data]],
			['bottom', ['close', ['x-bottom', 'y-bottom'], "context", (opt.bottom && opt.bottom.col)?opt.bottom.col:null, this.chart.data]]
		].forEach(function(item){
			me.add.apply(this, item);
		});
		return this;
	};
	Chart.Plots = Plots;
//-----------------------------------------
//	Indicators
//-----------------------------------------
	var Indicators = Chart.Yo(function(chart, type, color, period, data){
		/*Set defaults*/
		period = period || 10;
		color = color || getRandomColor();
		type = type || 'sma';
		type = type.toLowerCase();
		data = data || chart.data;
		/*create data if needed*/
		if(data.constructor === Function){
			data = data();
		}
		/*Checks*/
		Chart.check(type, String, "type", "chart.indicators.add");
		(data)&&Chart.check(data, Array, "data", "chart.indicators.add");
		Chart.check(color, String, "color", "chart.indicators.add");
		Chart.check(period, Number, "period", "chart.indicators.add");
		/*Create plot*/
		var tma = techan.plot[type]()
				.xScale(chart.scales.get('x'))
				.yScale(chart.scales.get('y'));

		/*clear svg if needed*/
			// chart.svg().focus.select('.' + chart.id.replace(/#/g,"") + ".indicator." + type).remove();
		/*Create svg*/
		var svg = chart.svg().focus.append("g")
				.attr("class", chart.id.replace(/#/g,"") + " indicator " + type)
				.attr("clip-path", "url(#clip)");
		
		/*add data*/
		if(data)	{
			svg.datum(techan.indicator[type]()
				.period(period)(data)).call(tma)
				.select('path')
				.style('stroke',color);
		}
		return [svg, tma];
	});

	Indicators.prototype.init = function () {
		this.register('pre', function(chart){
			d3.selectAll('.indicator').remove();
		});
		return this;
	};
	Chart.Indicators = Indicators;

//-----------------------------------------
//	End
//-----------------------------------------
	techan.Chart = Chart;
})(techan);

