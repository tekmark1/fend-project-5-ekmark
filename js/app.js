/* ======= Model ======= */

var venueList = [

		{
			name : 'LA Fitness',
			latlng : {lat: 33.100049, lng: -96.803555},
			address : '9190 TX-121, Frisco',
			id : 0	
		},
		{
			name : 'In-N-Out Burger',
			latlng : {lat: 33.101787, lng: -96.804414},
			address : '2800 Preston Rd, Frisco',
			id : 1		
		},
		{
			name : 'Dr. Pepper Ballpark',
			latlng : {lat: 33.098322, lng: -96.819745},
			address : '7300 Roughriders Trail, Frisco',
			id : 2
		},
		{
			name : 'IKEA Dallas',
			latlng : {lat: 33.093828, lng: -96.821247},
			address : '7171 Ikea Dr, Frisco',
			id : 3
		},
		{
			name : 'Stonebriar Centre',
			latlng : {lat: 33.098718, lng: -96.811076},
			address : '2601 Preston Rd, Frisco',
			id : 4	
		}
];

function HTMLModel() {

	this.generateHTML = function(articles) {

		var infowindowContent = "";

		for (var i = 0; i < articles.length; i++) {

			var content = articles[i].content;
			var name = articles[i].name;
			var url = articles[i].url;
			var address = articles[i].address;
			var streetViewUrl = "http://maps.googleapis.com/maps/api/streetview?size=200x150&location=" + address + "";

			infowindowContent = "<div class='popup'><h1>" + name + "</h1><img src='" + streetViewUrl + "'><div id='wikilinks'><li><a href='" + url + "''>" + content + "</a></li></div></div>";
		};

		return infowindowContent;
	};
};

var HTML = new HTMLModel();

var ViewModel = function() {

	var self = this;

	this.articleList = ko.observableArray();

	this.article = function(name, url, address, content) {
		this.name = name;
		this.url = url;
		this.address = address;
		this.content = content;
	}

	var infowindow = new google.maps.InfoWindow();

	this.createMarker = function(name, latlng, id, address) {
		
		this.identifier = ko.observable(name);

		this.name = name;
		this.latlng = latlng;
		this.id = id;
		this.address = address;

		var marker = new google.maps.Marker({
			animation: google.maps.Animation.DROP,
			position: latlng,
			map: map
		});

		this.isVisible = ko.observable(false);

    	this.isVisible.subscribe(function(currentState) {
    		if (currentState) {
    			marker.setMap(map);
    		} else {
    			marker.setMap(null);
    		}
    	});

    	this.isVisible(true);

    	this.marker = marker;

	};


	this.markers = [
		new self.createMarker(venueList[0].name, venueList[0].latlng, venueList[0].id, venueList[0].address),
		new self.createMarker(venueList[1].name, venueList[1].latlng, venueList[1].id, venueList[1].address),
		new self.createMarker(venueList[2].name, venueList[2].latlng, venueList[2].id, venueList[2].address),
		new self.createMarker(venueList[3].name, venueList[3].latlng, venueList[3].id, venueList[3].address),
		new self.createMarker(venueList[4].name, venueList[4].latlng, venueList[4].id, venueList[4].address)
	];

	this.markerArray = ko.observableArray(self.markers);

	this.query = ko.observable('');

	//filter marker and list names when they match text inputed into search bar
	this.filterMarkers = ko.computed(function() {

		var search = self.query().toLowerCase();

		return ko.utils.arrayFilter(self.markerArray(), function(marker) {
			var doesMatch = marker.identifier().toLowerCase().indexOf(search) >= 0;

			marker.isVisible(doesMatch);

			return doesMatch;
		});
	});

	this.apiData = function(marker) {

		var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.name + '&limit=3&format=json&callback=wikiCallback';
		
		var wikiFail = 'Failed to get Wikipedia resources';

		parameters = {
			url: wikiUrl,
			dataType: "jsonp",
			success: function( response ) {

				self.articleList.removeAll();
				var articles = response[1];
				var content = articles[0];
				var url = 'http://en.wikipedia.org/wiki/' + content;

				self.articleList.push(new self.article(marker.name, url, marker.address, content));
				
			}
		};
		$.ajax(parameters);
	};

	self.openInfoWindow = function(marker) {
		self.apiData(marker);

		window.setTimeout(function() {
			infowindow.setContent(HTML.generateHTML(self.articleList()));
			infowindow.open(map, marker.marker);
		}, 300);

		if (marker.marker.getAnimation() !== null) {
			marker.marker.setAnimation(null);
		} else {
			marker.marker.setAnimation(google.maps.Animation.BOUNCE);
			setTimeout(function() { marker.marker.setAnimation(null); }, 1450);
		};
	};

	for (var i = 0; i < self.markers.length; i++) {

		var indexedNumber = self.markers[i]

		indexedNumber.marker.addListener('click', (function(markerCopy) {
			
			return function() {
				self.apiData(markerCopy);

				window.setTimeout(function() {
					infowindow.setContent(HTML.generateHTML(self.articleList()));
					infowindow.open(map, markerCopy.marker);
				}, 300);

				if (markerCopy.marker.getAnimation() !== null) {
					markerCopy.marker.setAnimation(null);
				} else {
					markerCopy.marker.setAnimation(google.maps.Animation.BOUNCE);
					setTimeout(function() { markerCopy.marker.setAnimation(null); }, 1450);
				};
			};

		})(indexedNumber));
	};
};

var map;

//create map and event listener to close other window if another marker is clicked
var initMap = function() {
	var self = this;

	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 33.098718, lng: -96.811076},
		zoom: 15
	});

	google.maps.event.addListener(map, 'click', function() {
        infowindow.close();
    });

};

//wrap initMap() and ko bindings in a function so they can be run with google.api callback
function runApp() {
	initMap();
	ko.applyBindings(new ViewModel());
};
