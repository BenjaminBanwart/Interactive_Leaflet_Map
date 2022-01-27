const leafMap = {
	coordinates: [],
	businesses: [],
	map: {},
	markers: {},

    
	// build leaflet map
	createMap() {
		this.map = L.map('map', {
		    center: this.coordinates,
		    zoom: 11,
		});


		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		    attribution:
			    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		    minZoom: '15',
		}).addTo(this.map)

        var marker = L.marker(this.coordinates).addTo(this.map);
		marker.bindPopup('<b>You are here</b><br>').openPopup()
	},


	// add business markers
	addMarkers() {
		for (var i = 0; i < this.businesses.length; i++) {
		this.markers = L.marker([
			this.businesses[i].lat,
			this.businesses[i].long,
		])
			.bindPopup(`<b>${this.businesses[i].name}</b>`)
			.addTo(this.map)
		}
	}
};


// get coordinates via geolocation api
async function getCoords(){
    const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
    })
    return [pos.coords.latitude, pos.coords.longitude]
};


// get foursquare businesses
async function requestFoursquare(business) {
	const options = {
		method: 'GET',
		headers: {
		    Accept: 'application/json',
		    Authorization: 'fsq3HJQIS1hRid+/tk5OfJNtfZDUw3kp4c5cgEmcmJ72N34='
		}
	}
	let limit = 5
	let lati = leafMap.coordinates[0]
	let long = leafMap.coordinates[1]
	let response = await fetch(`https://api.foursquare.com/v3/places/search?&query=${business}&limit=${limit}&ll=${lati}%2C${long}`, options)
	let data = await response.text()
	let parsedData = JSON.parse(data)
	let businessResults = parsedData.results
	return businessResults
};


// process foursquare array
function processFoursquare(data) {
	let businessData = data.map((element) => {
		let loc = {
			name: element.name,
			lat: element.geocodes.main.latitude,
			long: element.geocodes.main.longitude
		};
		return loc
	})
	return businessData
};


// event handlers
// window load
window.onload = async () => {
    const myCoords = await getCoords()
    leafMap.coordinates = myCoords
    leafMap.createMap()
};


// business submit button
document.getElementById('submit').addEventListener('click', async (event) => {
	event.preventDefault()
	let business = document.getElementById('business-type').value
	let data = await requestFoursquare(business)
	leafMap.businesses = processFoursquare(data)
	leafMap.addMarkers()
});

