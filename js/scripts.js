String.prototype.linkReplace = function() {
	return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function(url) {
		return url;
	});
};

var ICF = {}

ICF.searchType = 'Flickr';

ICF.Interactions = {
    
    clickMe: function() {
        $('.btn').on('click', function(e) {
        	e.preventDefault();
            $(this).addClass('active');
        });
    }
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


ICF.FlickrRequest = (function(){

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
		$.getJSON('http://api.flickr.com/services/rest/?&method=flickr.photos.search&api_key=' + apiKey + '&format=json&tags=' + searchTerm + '&sort=relevance&extras=description&per_page=40&jsoncallback=?',
			function(result){

				if (result.stat == "ok"){
					var myPhotos = result.photos.photo;
					var html = '';
					if (myPhotos.length > 0) {
						for (var i=0; i < myPhotos.length; i++) {
							var p = myPhotos[i];
							
							var desc = p.description._content;
							desc = desc.linkReplace();
							if (i == 0 || i == 10 || i == 20 || i == 30) { html += '<div>'; }
							html += 
								'<a href="http://www.flickr.com/photos/' + p.owner + '/' + p.id + '" class="i' + i + '" data-desc="">' +	
									'<img src="http://farm' + p.farm + '.staticflickr.com/' + p.server + '/' + p.id + '_' + p.secret + '_z.jpg" class="i' + i + '" />' +
								'</a>';
							if (i == 9 || i == 19 || i == 29 || i == 39) { html += '</div>'; }
							
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
	        	var val = $(this).prev().val();
	            (ICF.searchType == 'Flickr') ? loadFlickr(val) : loadInstagram(val);
	            ICF.InputVal.store(val);
	        });
			
	    	$(document).on('keyup', function(e){
	    		e.preventDefault();
				var val = $('#js-search').val();
	    		var c = (e.keyCode ? e.keyCode : e.which);
	    		if (c == '13') {
	    			$('.js-load').addClass('active');
	    			ICF.InputVal.store(val);
	    			(ICF.searchType == 'Flickr') ? loadFlickr(val) : loadInstagram(val);
	    		}
	    	});
    
			
		}
	
	}

})();

$(document).ready(function(){
	ICF.Interactions.clickMe(); 
	ICF.FlickrRequest.init();
	ICF.InputVal.get();
});

