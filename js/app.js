/* ======= Model ======= */

var venueList = [

		{
			name : 'LA Fitness',
			latlng : {lat: 33.100049, lng: -96.803555},
			street : '9190 TX-121',
			city : 'Frisco',
			id : 0	
		},
		{
			name : 'In-N-Out Burger',
			latlng : {lat: 33.101787, lng: -96.804414},
			street : '2800 Preston Rd',
			city : 'Frisco',
			id : 1		
		},
		{
			name : 'Dr. Pepper Ballpark',
			latlng : {lat: 33.098322, lng: -96.819745},
			street : '7300 Roughriders Trail',
			city : 'Frisco',
			id : 2
		},
		{
			name : 'IKEA Dallas',
			latlng : {lat: 33.093828, lng: -96.821247},
			street : '7171 Ikea Dr',
			city : 'Frisco',
			id : 3
		},
		{
			name : 'Stonebriar Centre',
			latlng : {lat: 33.098718, lng: -96.811076},
			street : '2601 Preston Rd',
			city : 'Frisco',
			id : 4	
		}
];

var infowindow;
var markers = [];

var ViewModel = function() {
	var self = this;

	this.venues = ko.observableArray([]);

	venueList.forEach(function(venueItem) {
		self.venues.push( new createMarkers(venueItem) );
	});

	this.linkMarker = function(id) {
		google.maps.event.trigger(markers[id], 'click');
	};

	this.query = ko.observable('');

	this.filterMarkers = ko.computed(function() {

		var search = self.query().toLowerCase();

		return ko.utils.arrayFilter(self.venues(), function(marker) {
			var doesMatch = marker.name().toLowerCase().indexOf(search) >= 0;

			marker.isVisible(doesMatch);

			return doesMatch;
		});
	});
};


var createMarkers = function(data) {

	var self = this;

	infowindow = new google.maps.InfoWindow;

	this.name = ko.observable(data.name);
	this.street = ko.observable(data.street);
	this.city = ko.observable(data.city);
	this.latlng = ko.observable(data.latlng);
	this.id = ko.observable(data.id);

	var latlng = self.latlng();


	var marker = new google.maps.Marker({
		animation: google.maps.Animation.DROP,
		position: latlng,
		map: map
	});
	marker.addListener('click', toggleBounce);

	function toggleBounce() {
		if (marker.getAnimation() !== null) {
			marker.setAnimation(null);
		} else {
			marker.setAnimation(google.maps.Animation.BOUNCE);
			setTimeout(function() { marker.setAnimation(null); }, 1450);
		};
	};

	var name = self.name();
	var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + name + '&limit=3&format=json&callback=wikiCallback';
	$.ajax({
		url: wikiUrl,
		dataType: "jsonp",
		success: function( response ) {


				var articleList = response[1];

				var articleStr = articleList[0];
						
				var url = 'http://en.wikipedia.org/wiki/' + articleStr;
				var street = self.street();
				var city = self.city();
				var address = street + "," + city;
				var streetviewURL = "http://maps.googleapis.com/maps/api/streetview?size=200x150&location=" + address + "";
				var infowindowContent = "<div class='popup'><h1>" + name + "</h1><img src='" + streetviewURL + "'><div id='wikiLinks'><li><a href='" + url + "'>" + articleStr + "</a></li></div></div>";
				
			
				marker.addListener('click', function() {
					infowindow.setContent(infowindowContent);
					infowindow.open(map, marker);
				});
		}
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

    this.marker = ko.observable(marker);

    markers.push(marker);
};



var map;

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

function runApp() {
	initMap();
	ko.applyBindings(new ViewModel());
};
