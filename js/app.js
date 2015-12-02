/* ======= Model ======= */

var venueList = ko.observableArray([

		{
			name : 'LA Fitness',
			latlng : {lat: 33.100049, lng: -96.803555},
			street : '9190 TX-121',
			city : 'Frisco',
			id : 'ChIJtRvafug8TIYReEVgHkaNN1M',
			marker: null
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



var createMarkers = function(position, name, street, city) {
	var marker = new google.maps.Marker({
		animation: google.maps.Animation.DROP,
		position: position,
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

	var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + name + '&limit=3&format=json&callback=wikiCallback';
	$.ajax({
		url: wikiUrl,
		dataType: "jsonp",
		success: function( response ) {


			var articleList = response[1];

			var articleStr = articleList[0];
						
			var url = 'http://en.wikipedia.org/wiki/' + articleStr;

			var address = street + "," + city;
			var streetviewURL = "http://maps.googleapis.com/maps/api/streetview?size=200x150&location=" + address + "";
			var infowindowContent = "<div class='popup'><h1>" + name + "</h1><img src='" + streetviewURL + "'><div id='wikiLinks'><li><a href='" + url + "'>" + articleStr + "</a></li></div></div>";
			var infowindow = new google.maps.InfoWindow({
				content: infowindowContent
			});
			marker.addListener('click', function() {
				infowindow.open(map, marker);
			});
		}
	});

};


var map;

var initMap = function() {
	var self = this;

	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 33.098718, lng: -96.811076},
		zoom: 15
	});

	var markerItems = [];
	markerItems.push(
		new createMarkers(venueList()[0].latlng, venueList()[0].name, venueList()[0].street, venueList()[0].city), 
		new createMarkers(venueList()[1].latlng, venueList()[1].name, venueList()[1].street, venueList()[1].city),
		new createMarkers(venueList()[2].latlng, venueList()[2].name, venueList()[2].street, venueList()[2].city),
		new createMarkers(venueList()[3].latlng, venueList()[3].name, venueList()[3].street, venueList()[3].city),
		new createMarkers(venueList()[4].latlng, venueList()[4].name, venueList()[4].street, venueList()[4].city)
	);
	console.log(markerItems);
};


var ViewModel = function() {

	var self = this;

	this.venues = ko.observableArray([]);

	venueList().forEach(function(venueItem){
		self.venues.push( new VenueListView(venueItem) );
	});

	this.markerArray = ko.observableArray([]);
	
};


ko.applyBindings(ViewModel());
