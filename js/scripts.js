String.prototype.linkReplace = function() {
	return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function(url) {
		return url;
	});
};

var ICF = {}

ICF.searchOptions = {
	type : '',
	mode : '',
	count : ''
};

ICF.InputVal = {

	store : function(str){
		localStorage.setItem('searchString', str);
	},
	get : function(){
		var str = localStorage.getItem('searchString');
		$('#js-search').val(str);
	}

};

ICF.RadioVal = {

	load : function(){
		if (localStorage.getItem('searchType')) {
			ICF.searchOptions.type = localStorage.getItem('searchType');
			if (ICF.searchOptions.type == 'Instagram') {
				$('input[value="Instagram"]').attr('checked','checked');
			}
		} else {
			ICF.searchOptions.type = $('input[name="searchType"]:checked').val();
		}
		
		if (localStorage.getItem('searchMode')) {
			ICF.searchOptions.mode = localStorage.getItem('searchMode');
			if (ICF.searchOptions.mode == 'Edit') {
				$('input[value="Edit"]').attr('checked','checked');
			}
		} else {
			ICF.searchOptions.mode = $('input[name="mode"]:checked').val();
		}
		
		(ICF.searchOptions.mode == 'Grid') ? ICF.searchOptions.count = 40 : ICF.searchOptions.count = 1
		
		$('input[name="searchType"]').on('change', function(){
			var val = $('input[name="searchType"]:checked').val();
			ICF.RadioVal.update('type', val);
		});
		$('input[name="mode"]').on('change', function(){
			var val = $('input[name="mode"]:checked').val();
			ICF.RadioVal.update('mode', val);
		});
	
	},
	update : function(x, val){
	
		if (x == 'type') {
			ICF.searchOptions.type = val;
			localStorage.setItem('searchType', val);
		} else {
			ICF.searchOptions.mode = val;
			localStorage.setItem('searchMode', val);
			(val == 'Grid') ? ICF.searchOptions.count = 40 : ICF.searchOptions.count = 1
		}
	
	}

};

ICF.ImageRequest = (function(){

	/*
	* For search parameters: http://www.flickr.com/services/api/explore/flickr.photos.search
	* For image size options: http://www.flickr.com/services/api/misc.urls.html
	*/

	var apiKey = '8b9c8dd3138cbf709f06a0daacb7ef69',
		secret = 'a3571faab9da72e1',
		userId = '72039957@N06',
		accessToken = '9143472.e3623bf.bff78de44a9548ac83513b6c6316c71b';
		
	var loadFlickr = function (searchTerm){
		searchTerm = searchTerm.split(' ').join('+');
		$.getJSON('http://api.flickr.com/services/rest/?&method=flickr.photos.search&api_key=' + apiKey + '&format=json&tags=' + searchTerm + '&sort=relevance&extras=description&per_page=' + ICF.searchOptions.count + '&jsoncallback=?',
			function(result){

				if (result.stat == "ok"){
					var myPhotos = result.photos.photo;
					var html = '';
					if (myPhotos.length > 0) {
						for (var i=0; i < myPhotos.length; i++) {
							var p = myPhotos[i];
							
							var desc = p.description._content;
							desc = desc.linkReplace();
							if (ICF.searchOptions.mode == 'Grid') {
								if (i == 0 || i == 10 || i == 20 || i == 30) { html += '<div class="col">'; }
								html += 
									'<a href="http://www.flickr.com/photos/' + p.owner + '/' + p.id + '" class="img js-img i' + i + '" data-desc="">' +	
										'<img src="http://farm' + p.farm + '.staticflickr.com/' + p.server + '/' + p.id + '_' + p.secret + '_z.jpg" class="i' + i + '" />' +
									'</a>';
								if (i == 9 || i == 19 || i == 29 || i == 39) { html += '</div>'; }
							} else {
								html += 
									'<div class="col colx3 js-edit-container">' + 
										'<a href="http://www.flickr.com/photos/' + p.owner + '/' + p.id + '" class="img js-img i' + i + '" data-desc="">' +	
											'<img src="http://farm' + p.farm + '.staticflickr.com/' + p.server + '/' + p.id + '_' + p.secret + '_b.jpg" class="i' + i + '" />' +
										'</a>' + 
									'</div>' + 
									'<div class="col edit-panel">' + 
										'<p>This is only going to work in Chrome Canary for the moment.</p>' +
										'<h4>Blur</h4>' + 
										'<input type="range" value="0" max="10" name="blur" />' + 
										'<label>0</label>' + 
										'<h4>Sepia</h4>' + 
										'<input type="range" min="0" name="sepia" max="1" step="0.1" value="0" />' + 
										'<label>0</label>' + 
										'<h4>Grayscale</h4>' + 
										'<input type="range" min="0" name="grayscale" max="1" step="0.1" value="0" />' + 
										'<label>0</label>' + 
										'<h4>Brightness</h4>' + 
										'<input type="range" min="0" name="brightness" max="1" step="0.1" value="0" />' + 
										'<label>0</label>' + 
										'<h4>Contrast</h4>' + 
										'<input type="range" min="1" name="contrast" max="5" step="0.1" value="0" />' + 
										'<label>0</label>' + 
										'<h4>Hue Rotate</h4>' + 
										'<input type="range" min="0" name="hue-rotate" max="360" step="30" value="0" />' + 
										'<label>0</label>' + 
										'<h4>Invert</h4>' + 
										'<input type="range" min="0" name="invert" max="1" step="0.1" value="0" />' + 
										'<label>0</label>' + 
										'<h4>Saturate</h4>' + 
										'<input type="range" min="1" name="saturate" max="10" step="1" value="0" />' + 
										'<label>0</label>' +
									'</div>';
							}
							
						}
					} else {
						html += '<h3>Better luck next time</h3>';
					}
					appendResult(html);
					$('.js-load').removeClass('active');

				} else {
					//Error
				}				
			}
		);

	};
	
	var loadInstagram = function(searchTerm){
		searchTerm = searchTerm.split(' ').join('+');
		/*$.getJSON('https://api.instagram.com/v1/tags/' + searchTerm + '/media/recent?access_token=' + accessToken + '&jsoncallback=?',
			function(result){
				console.log(result);
				
			}
		);*/
		$.ajax({
		  url: 'https://api.instagram.com/v1/tags/' + searchTerm + '/media/recent?access_token=' + accessToken + '&jsoncallback=?',
		  dataType: "jsonp",
		  success: function(result){
				console.log(result);
		  }
		});

	};
	
	var appendResult = function (html) {
	
		var myContainer = $('.js-gal-container');
		myContainer.html(html);	
	
	};
	
	
	return {
	
		init : function() {
			
	        $('.js-load').on('click', function(e) {
		        e.preventDefault();
	        	var val = $(this).prev().val();
	        	if (val != '') {
			        $(this).addClass('active');
		            (ICF.searchOptions.type == 'Flickr') ? loadFlickr(val) : loadInstagram(val);
		            ICF.InputVal.store(val);
		        }
	        });
			
	    	$(document).on('keyup', function(e){
	    		e.preventDefault();
				var val = $('#js-search').val();
	    		var c = (e.keyCode ? e.keyCode : e.which);
	    		if (c == '13' && val != '') {
	    			$('.js-load').addClass('active');
	    			ICF.InputVal.store(val);
	    			(ICF.searchOptions.type == 'Flickr') ? loadFlickr(val) : loadInstagram(val);
	    		}
	    	});
	    
    
			
		}
	
	}

})();

ICF.ImageEdit = (function(){
	
	var filter = {};

	var update = function(type, val){
		switch(type) {
			case 'blur' :
				filter.blur = type + '(' + val +'px)';
				break;
			case 'hue-rotate' :
				filter.blur = type + '(' + val +'deg)';
				break;
			default :
				filter[type] = type + '(' + val + ')';
				break;
		}
		var str = '';
		for (var x in filter) {
			str += filter[x] + ' '; 
		}
		$('.js-gal-container').find('img').attr('style', '-webkit-filter:' + str );
	}

	return {
		init : function(){
			
			$('.js-gal-container').on('change', 'input[type="range"]', function(e){
				var val = $(this).val(),
					type = $(this).attr('name');
				$(this).next().text(val.substr(0,3));
				update(type, val);
			});

			
	
		}
	}
	
})();

$(document).ready(function(){
	ICF.ImageRequest.init();
	ICF.InputVal.get();
	ICF.RadioVal.load();
	ICF.ImageEdit.init();
});

