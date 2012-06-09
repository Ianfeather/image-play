String.prototype.linkReplace = function() {
	return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function(url) {
		return url;
	});
};

var ICF = {};

ICF.searchOptions = {
	type : '',
	mode : '',
	count : ''
};
ICF.editPanel = '<div class="col edit-panel">' + 
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


// =============================
// = Save the last search text =
// =============================
ICF.InputVal = {

	store : function(str){
		localStorage.setItem('searchString', str);
	},
	get : function(){
		var str = localStorage.getItem('searchString');
		$('#js-search').val(str);
	}

};


// =============================
// = Save the last search mode =
// =============================
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
		
		ICF.searchOptions.count = (ICF.searchOptions.mode == 'Grid') ? 40 : 1;
		
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
			ICF.searchOptions.count = (val == 'Grid') ? 40 : 1;
		}
	
	}

};



ICF.EditMode = (function(){
	
	var getOriginalSize = function (sizes) {
    var lrg = _(sizes).find(function (size) {
      return size.label === "Large";
    });
		if (lrg !== undefined) {
			return lrg;
		} else {
			return _(sizes).find(function (size) {
				return size.label === "Medium";
			});
		}
  };
	
	$(document).on('gotSizes', function(e, photo){
		var pSizes = photo.sizes.sizes.size,
				p      = photo.photo;

		var x = getOriginalSize(pSizes);

		html = 
			'<div class="col colx3 js-edit-container">' + 
				'<a href="http://www.flickr.com/photos/' + p.owner + '/' + p.id + '" class="img js-img" data-desc="">' +	
					'<img src="' + x.source + '" />' +
				'</a>' + 
			'</div>' + 
			ICF.editPanel;
		
		ICF.ImageRequest.appendResult(html);
		
	});
	

})();


ICF.ImageRequest = (function(){

	/*
	* For search parameters: http://www.flickr.com/services/api/explore/flickr.photos.search
	* For image size options: http://www.flickr.com/services/api/misc.urls.html
	*/

	var apiKey = '8b9c8dd3138cbf709f06a0daacb7ef69';
		
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
							if (ICF.searchOptions.mode === 'Grid') {
								if (i === 0 || i === 10 || i === 20 || i === 30) { html += '<div class="col">'; }
								html += 
									//'<a href="http://www.flickr.com/photos/' + p.owner + '/' + p.id + '" class="img js-img i' + i + '" data-desc="">' +	
									'<a href="#" class="js-grid-photo grid-photo">' +	
										'<img src="http://farm' + p.farm + '.staticflickr.com/' + p.server + '/' + p.id + '_' + p.secret + '_z.jpg" class="i' + i + '" />' +
									'</a>';
								if (i === 9 || i === 19 || i === 29 || i === 39) { html += '</div>'; }
								ICF.ImageRequest.appendResult(html);
							} else {
								$.getJSON('http://api.flickr.com/services/rest/?&method=flickr.photos.getSizes&api_key=' + apiKey + '&photo_id=' + p.id + '&format=json&jsoncallback=?', function (data) {
									var photoInfo = {};
									photoInfo.sizes = data;
									photoInfo.photo = p;
									$(document).trigger('gotSizes', photoInfo);
								});
								
							}
							
						}
					} else {
						html += '<h3>No results, better luck next time</h3>';
						ICF.ImageRequest.appendResult(html);
					}

				} else {
					//Error
				}				
			}
		);

	};
	
	return {
	
		appendResult : function (html) {
			var myContainer = $('.js-gal-container');
			myContainer.html(html);	
			$('.js-load').removeClass('active');	
		},
		
		init : function() {
			
			$('.js-load').on('click', function(e) {
				e.preventDefault();
				var val = $(this).prev().val();
				if (val !== '') {
					$(this).addClass('active');
					if (ICF.searchOptions.type === 'Flickr') { loadFlickr(val);} else { loadInstagram(val);}
					ICF.InputVal.store(val);
				}
			});
			
			$(document).on('keyup', function(e){
				e.preventDefault();
				var val = $('#js-search').val();
				var c = (e.keyCode ? e.keyCode : e.which);
				if (c === '13' && val !== '') {
					$('.js-load').addClass('active');
					ICF.InputVal.store(val);
					if (ICF.searchOptions.type === 'Flickr') { loadFlickr(val);} else {loadInstagram(val);}
				}
			});

			$('.js-gal-container').on('click', '.js-grid-photo', function(e){
				e.preventDefault();
				var img, html = '';
				img = $(this).children().attr('src');
				img = img.substr(0, (img.length-5)) + 'b.jpg';
				html += '<div class="col colx3 js-edit-container">' + 
							'<a href="#" class="img js-img" data-desc="">' +	
								'<img src="' + img + '" class="i" />' +
							'</a>' + 
						'</div>' + ICF.editPanel;
				ICF.ImageRequest.appendResult(html);
			});
			
		}
	
	};

})();

ICF.ImageEdit = (function(){
	
	var filter = {};

	var update = function(type, val){
		switch(type) {
			case 'blur' :
				filter.blur = type + '(' + val +'px)';
				break;
			case 'hue-rotate' :
				filter['hue-rotate'] = type + '(' + val +'deg)';
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
	};

	return {
		init : function(){
			
			$('.js-gal-container').on('change', 'input[type="range"]', function(e){
				var val = $(this).val(),
					type = $(this).attr('name');
				update(type, val);
				if (type == 'blur') {val = val.substr(0,3) + "px";} 
				else {val = val.substr(0,3);}
				$(this).next().text(val);
				
			});

			
	
		}
	};
	
})();

$(document).ready(function(){
	ICF.ImageRequest.init();
	ICF.InputVal.get();
	ICF.RadioVal.load();
	ICF.ImageEdit.init();
});

