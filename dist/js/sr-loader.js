/**
 * Loading screen controll class
 * @param {Strting} cnt  container of html
 * @param {String} gimg loading-image
 * @param {String} bimg error-image
 */
function SRLoader (cnt, gimg, bimg) {
	/**
	 * Initilize loader 
	 * @param  {String} txt 
	 * @return {this}    
	 */
	this.start = function(txt){
		txt = txt || 'Loading...';
		$(cnt).css({
			'width'   : '100%',
			'opacity' : 1,
			'height'  : '100%'
		});
		$(cnt).css({background:"rgba(58, 111, 150, 0.7)"});
		$(cnt + ' span').html(txt);
		$(cnt + ' .spinner').css({
			'background-image':gimg,
			'animation':'rotateplane 3s infinite ease-in-out',
			width:"100px",height:"100px"
		});
		return this;
	};
	/**
	 * Stop Laoder
	 * @return {this} 
	 */
	this.stop = function(){
		$(cnt).css({
			'width'   : '0%',
			'opacity' : 0,
			'height'  : '0%',
		});
		return this;
	}
	/**
	 * Call an error
	 * @param  {String} txt 
	 * @return {this}     
	 */
	this.error = function(txt){
		txt = txt || "Failed to connect, please make sure you have a good internet connection.";
		$(cnt).css({background:"rgba(238, 115, 115, 0.7)"});
		$(cnt + ' span').html(txt);
		$(cnt + ' .spinner').css({'background-image':bimg,'animation':'none',width:"200px",height:"200px"});
	}
}

/**
 * Setup loader
 * @type {SRLoader}
 */
var srloader = new SRLoader('.loading','url("./img/sr.png")','url("./img/fail-load.png")');