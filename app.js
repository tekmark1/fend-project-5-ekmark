/* ======= Model ======= */

var venueList = ko.observableArray([

		{
			name : 'LA Fitness',
			latlng : {lat: 33.100049, lng: -96.803555},
			street : '9190 TX-121',
			city : 'Frisco',
			id : 'ChIJtRvafug8TIYReEVgHkaNN1M',
			marker : null
		},
		{
			name : 'In-N-Out Burger',
			latlng : {lat: 33.101787, lng: -96.804414},
			street : '2800 Preston Rd',
			city : 'Frisco',
			id : 'ChIJWYMPi-fJj4ARscYl1OrSaTc',
			marker : null	
		},
		{
			name : 'Dr. Pepper Ballpark',
			latlng : {lat: 33.098322, lng: -96.819745},
			street : '7300 Roughriders Trail',
			city : 'Frisco',
			id : 'ChIJvUQAkJY8TIYRLygohdxesrg',
			marker : null
		},
		{
			name : 'IKEA Dallas',
			latlng : {lat: 33.093828, lng: -96.821247},
			street : '7171 Ikea Dr',
			city : 'Frisco',
			id : 'ChIJN42Gm708TIYRp7zdNGJzkgg',
			marker : null
		},
		{
			name : 'Stonebriar Centre',
			latlng : {lat: 33.098718, lng: -96.811076},
			street : '2601 Preston Rd',
			city : 'Frisco',
			id : 'ChIJ420EDus8TIYRLnGI1cgPeeQ',
			marker : null
		}
]);



var VenueListView = function(data) {
	this.name = ko.observable(data.name);
	this.latlng = ko.observable(data.latlng);
	this.id = ko.observable(data.id);
};


var ViewModel = function(){

	var self = this;

	this.venues = ko.observableArray([]);

	venueList().forEach(function(venueItem){
		self.venues.push( new VenueListView(venueItem) );
	});
	
};

var map, i, marker;

var initMap = function() {
	var self = this;

	var map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 33.098718, lng: -96.811076},
		zoom: 15
	});

	var infoWindowOpen = function(name, streetview, marker) {
		var infoWindow = new google.maps.InfoWindow({
			content: "<div class='popup'><h1>" + name + "</h1><img src='" + streetview + "'>"/*<div id='wikiLinks'><li><a href='" + wikiUrl + "'>" + articleStrCopy + "</a></li></div>*/ + "</div>"
		});
		infoWindow.open(map, marker);
	};

	var markerArray = [];

	for (i = 0; i < venueList().length; i++) {

		var self = this;

		this.marker = new google.maps.Marker({
			animation: google.maps.Animation.DROP,
			position: venueList()[i].latlng,
			map: map
		});

		markerArray.push(this.marker);

		google.maps.event.addListener(self.marker, 'click', (function(markerCopy) {
			return function() {
				if (markerCopy.getAnimation() !== null) {
					markerCopy.setAnimation(null);
				} else {
					markerCopy.setAnimation(google.maps.Animation.BOUNCE);
					setTimeout(function() { markerCopy.setAnimation(null); }, 1450);
				};
			};			
		})(self.marker));

		google.maps.event.addListener(self.marker, 'click', (function(marker, venueListIndex) {
			return function() {

				var name = venueList()[venueListIndex].name;
				var street = venueList()[venueListIndex].street;
				var city = venueList()[venueListIndex].city;
				var address = street + "," + city;
				var streetviewURL = "http://maps.googleapis.com/maps/api/streetview?size=200x150&location=" + address + "";
				var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + name + '&limit=3&format=json&callback=wikiCallback';
				infoWindowOpen(name, streetviewURL, marker);

				$.ajax({
					url: wikiUrl,
					dataType: "jsonp",
					success: function( response ) {
						return function() {

							var articleList = response[1];

							var	articleStr = articleList[0];
						
							var url = 'http://en.wikipedia.org/wiki/' + articleStr;

						};
					}
				});
			};
		})(this.marker, i));
	};


};

ko.applyBindings(ViewModel());
