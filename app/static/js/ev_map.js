let map;
let placesService;
let directionsService;
let directionsRenderer;
let directionsRenderers = []; //Contains multiple routes
let markers = [];
let customMarkers = []
let userLocation;
let infoWindow;
let userMarker;
let startMarker = null;
let endMarker = null;
let elevationChart = null;
let rangeCircle = null;

const vehicles = [
    { name: 'Large Car', image: "static/images/Large Car.png" },
    { name: 'Medium Car', image: "static/images/Medium Car.png" },
    { name: 'People Mover', image: "static/images/People Mover.png" },
    { name: 'Small Car', image: "static/images/Small Car.png" },
    { name: 'Sports Car', image: "static/images/Sports Car.png" },
    { name: 'Ute (2WD)', image: "static/images/Ute (2WD).png" },
    { name: 'Van', image: "static/images/Van.png" }
];

let currentVehicle = vehicles.find(v => v.name === 'Small Car');

function initMap() {
    const mapStyles = [
        {
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#ebe3cd"
            }
          ]
        },
        {
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#523735"
            }
          ]
        },
        {
          "elementType": "labels.text.stroke",
          "stylers": [
            {
              "color": "#f5f1e6"
            }
          ]
        },
        {
          "featureType": "administrative",
          "elementType": "geometry",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "administrative",
          "elementType": "geometry.stroke",
          "stylers": [
            {
              "color": "#c9b2a6"
            }
          ]
        },
        {
          "featureType": "administrative.land_parcel",
          "elementType": "geometry.stroke",
          "stylers": [
            {
              "color": "#dcd2be"
            }
          ]
        },
        {
          "featureType": "administrative.land_parcel",
          "elementType": "labels",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "administrative.land_parcel",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#ae9e90"
            }
          ]
        },
        {
          "featureType": "landscape.natural",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#dfd2ae"
            }
          ]
        },
        {
          "featureType": "poi",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#dfd2ae"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "labels.text",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#93817c"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "geometry.fill",
          "stylers": [
            {
              "color": "#a5b076"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#447530"
            }
          ]
        },
        {
          "featureType": "road",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#f5f1e6"
            }
          ]
        },
        {
          "featureType": "road",
          "elementType": "labels.icon",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "road.arterial",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#fdfcf8"
            }
          ]
        },
        {
          "featureType": "road.arterial",
          "elementType": "labels",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#f8c967"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry.stroke",
          "stylers": [
            {
              "color": "#e9bc62"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "labels",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "road.highway.controlled_access",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#e98d58"
            }
          ]
        },
        {
          "featureType": "road.highway.controlled_access",
          "elementType": "geometry.stroke",
          "stylers": [
            {
              "color": "#db8555"
            }
          ]
        },
        {
          "featureType": "road.local",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "road.local",
          "elementType": "labels",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "road.local",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#806b63"
            }
          ]
        },
        {
          "featureType": "transit",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "transit.line",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#dfd2ae"
            }
          ]
        },
        {
          "featureType": "transit.line",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#8f7d77"
            }
          ]
        },
        {
          "featureType": "transit.line",
          "elementType": "labels.text.stroke",
          "stylers": [
            {
              "color": "#ebe3cd"
            }
          ]
        },
        {
          "featureType": "transit.station",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#dfd2ae"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "geometry.fill",
          "stylers": [
            {
              "color": "#b9d3c2"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#92998d"
            }
          ]
        }
      ];

    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -37.8136, lng: 144.9631 },  // Default center (Melbourne)
        zoom: 12,
        styles: mapStyles,
        mapTypeControl: false,
        streetViewControl: false
    });

    placesService = new google.maps.places.PlacesService(map);
    directionsService = new google.maps.DirectionsService();getUserLocation
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
        polylineOptions: {
            strokeColor: '#6495ED',
            strokeOpacity: 1.0,
            strokeWeight: 55
        }
    });
    
    infoWindow = new google.maps.InfoWindow();

    const locationButton = document.createElement("button");
    locationButton.textContent = "Locate Me";
    locationButton.classList.add("custom-map-control-button");

    locationButton.addEventListener("click", getUserLocation);

    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(locationButton);

    getUserLocation();

    setupCustomAutocomplete('searchStations', 'stationSuggestions', searchNearbyChargingStations);
    setupCustomAutocomplete('destination', 'destSuggestions');
    setupCustomAutocomplete('startPoint', 'startSuggestions');
    setupCustomAutocomplete('rangeAddress', 'rangeSuggestions');  // rangeAddress 
}

function getUserLocation() {

    clearAllMarkers();  
    clearRoute();

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                updateUserMarker(userLocation);
                firestEnterChargingStations(userLocation);
            },
            (error) => {
                console.error("Error getting user location:", error);
                let errorMessage;
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Location request was denied. Please enable location services in your browser settings.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "The request to get user location timed out.";
                        break;
                    case error.UNKNOWN_ERROR:
                        errorMessage = "An unknown error occurred while trying to get location.";
                        break;
                }
                handleLocationError(true, infoWindow, map.getCenter(), errorMessage);
                updateUserMarker(map.getCenter());
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        handleLocationError(false, infoWindow, map.getCenter(), "Your browser doesn't support geolocation.");
        updateUserMarker(map.getCenter());
    }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos, errorMessage) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(errorMessage);
    infoWindow.open(map);
    alert(errorMessage);
}

function updateUserMarker(location) {
    if (!location || !location.lat || !location.lng) {
        console.error("Invalid location provided to updateUserMarker");
        return;
    }

    const customIcon = {
        url: 'static/images/car.png',
        scaledSize: new google.maps.Size(40, 40),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(20, 20)
    };

    if (userMarker) {
        userMarker.setPosition(location);
    } else {
        userMarker = new google.maps.Marker({
            position: location,
            map: map,
            icon: customIcon,
            title: "Your Location"
        });

        // Add click listener to the marker
        userMarker.addListener('click', function() {
            // Use Geocoder to get the address
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: location }, function(results, status) {
                if (status === 'OK') {
                    if (results[0]) {
                        const address = results[0].formatted_address;
                        // Create an InfoWindow
                        const infoWindow = new google.maps.InfoWindow({
                            content: `<div><strong>Your Location</strong><br>${address}</div>`
                        });
                        // Open the InfoWindow
                        infoWindow.open(map, userMarker);
                    } else {
                        console.log('No results found');
                    }
                } else {
                    console.log('Geocoder failed due to: ' + status);
                }
            });
        });
    }

    map.setCenter(location);
    map.setZoom(15);
}

function setupCustomAutocomplete(inputId, suggestionsId, callback) {
    const input = document.getElementById(inputId);
    const suggestions = document.getElementById(suggestionsId);

    const melbourneBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(-38.2566, 144.3336), 
        new google.maps.LatLng(-37.5045, 145.5182)  
    );

    input.addEventListener('input', debounce(() => {
        if (input.value.length > 2) {
            const service = new google.maps.places.AutocompleteService();
            service.getPlacePredictions({
                input: input.value,
                bounds: melbourneBounds, 
                componentRestrictions: { country: 'au' } 
            }, (predictions, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    displaySuggestions(predictions, suggestions, input, callback);
                } else {
                    suggestions.style.display = 'none';
                }
            });
        } else {
            suggestions.style.display = 'none';
        }
    }, 300));
}


function displaySuggestions(predictions, suggestionsElement, input, callback) {
    suggestionsElement.innerHTML = '';
    predictions.forEach(prediction => {
        const div = document.createElement('div');
        div.textContent = prediction.description;
        div.addEventListener('click', () => {
            input.value = prediction.description;
            suggestionsElement.style.display = 'none';
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ placeId: prediction.place_id }, (results, status) => {
                if (status === 'OK' && callback) {
                    callback(results[0].geometry.location);
                }
            });
        });
        suggestionsElement.appendChild(div);
    });
    suggestionsElement.style.display = 'block';
}

function searchNearbyChargingStations(location) {

    // clear
    clearRangeCircle();
    clearMarkers();
    clearRoute();

    // clear startMarker endMarker and userMarker
    if (startMarker) {
        startMarker.setMap(null);
        startMarker = null;
    }
    if (endMarker) {
        endMarker.setMap(null);
        endMarker = null;
    }
    if (userMarker) {
        userMarker.setMap(null);
        userMarker = null;
    }
    
    const request = {
        location: location,
        radius: '5000',
        keyword: 'electric vehicle charging station',
        fields: ['place_id', 'geometry', 'name', 'vicinity']
    };

    placesService.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            clearMarkers();
            results.forEach(place => {
                addMarker(place);
            });
            map.setCenter(location);
            map.setZoom(14);
        }
    });
}

function firestEnterChargingStations(location) {

    const request = {
        location: location,
        radius: '5000',
        keyword: 'electric vehicle charging station',
        fields: ['place_id', 'geometry', 'name', 'vicinity']
    };

    placesService.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            clearMarkers();
            results.forEach(place => {
                addMarker(place);
            });
            map.setCenter(location);
            map.setZoom(14);
        }
    });
}



function addMarker(place) {
    const markerIcon = {
        url: 'static/images/charging-station.png',
        scaledSize: new google.maps.Size(35, 35),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(16, 32)
    };

    const marker = new google.maps.Marker({
        position: place.geometry.location,
        map: map,
        title: place.name,
        icon: markerIcon
    });

    marker.addListener('click', () => {
        const request = {
            placeId: place.place_id,
            fields: ['name', 'formatted_address', 'rating', 'user_ratings_total', 'opening_hours', 'photos', 'website', 'formatted_phone_number', 'wheelchair_accessible_entrance', 'current_opening_hours', 'editorial_summary']
        };

        placesService.getDetails(request, (placeResult, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                let content = `
                    <div class="station-info-window">
                        <h3>${placeResult.name}</h3>
                        <p>${placeResult.formatted_address}</p>
                `;

                if (placeResult.rating) {
                    content += `
                        <p>Rating: ${placeResult.rating.toFixed(1)} ⭐ (${placeResult.user_ratings_total} reviews)</p>
                    `;
                }

                if (placeResult.current_opening_hours) {
                    content += `
                        <p>${placeResult.current_opening_hours.open_now ? '<span style="color: green;">Open now</span>' : '<span style="color: red;">Closed</span>'}</p>
                    `;
                }

                if (placeResult.formatted_phone_number) {
                    content += `<p>Phone: ${placeResult.formatted_phone_number}</p>`;
                }


                if (placeResult.editorial_summary) {
                    content += `<p><em>${placeResult.editorial_summary.overview}</em></p>`;
                }

        
                const randomChargers = generateRandomChargers();
                content += `
                    <hr class="divider">
                    <div class="charger-info">
                        <h4>Available Chargers:</h4>
                        ${randomChargers.map(charger => `
                            <div class="charger-item">
                                <span class="charger-type">${charger.type}</span>
                                <span class="charger-quantity">${charger.quantity}</span>
                            </div>
                        `).join('')}
                    </div>
                `;

                content += `
                    <!--<button onclick="displayRoute({lat: ${place.geometry.location.lat()}, lng: ${place.geometry.location.lng()}})">Navigate Here</button>-->
                    <hr class="divider">
                    <div class="selector-container">
                        <label for="daySelector" class="selector-label">Popular times</label>
                        <select id="daySelector" onchange="updateUsageChart()">
                            <option value="0">Mondays</option>
                            <option value="1">Tuesdays</option>
                            <option value="2">Wednesdays</option>
                            <option value="3">Thursdays</option>
                            <option value="4">Fridays</option>
                            <option value="5">Saturdays</option>
                            <option value="6">Sundays</option>
                        </select>
                    </div>
                    <div style="width: 300px; height: 200px;">
                        <canvas id="usageChart"></canvas>
                    </div>
                </div>
                `;

                infoWindow.setContent(content);
                infoWindow.open(map, marker);

                // Initialize the chart after a short delay
                setTimeout(() => updateUsageChart(), 100);
            }
        });
    });

    markers.push(marker);
}

function generateRandomChargers() {
    const chargerTypes = [
        "6.9kW Slow Charger",
        "11kW Medium Charger",
        "22kW Medium Charger",
        "25kW Medium Charger",
        "50kW Fast Charger",
        "60kW Fast Charger",
        "62.5kW Fast Charger",
        "75kW Fast Charger",
        "120kW Fast Charger",
        "125kW Fast Charger",
        "150kW Very Fast Charger",
        "250kW Ultra Fast Charger"
    ];
    
    let chargers = [];
    const numTypes = Math.floor(Math.random() * 2) + 2; // 2 or 3 types
    for (let i = 0; i < numTypes; i++) {
        const type = chargerTypes[Math.floor(Math.random() * chargerTypes.length)];
        const quantity = Math.floor(Math.random() * 5) + 1; // 1 to 5
        chargers.push({ type, quantity });
    }
    return chargers;
}


function createUsageChart() {
    const ctx = document.getElementById('usageChart').getContext('2d');
    const data = generateUsageData();
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Usage',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Usage'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Weekly Usage Trend'
                }
            }
        }
    });
}

function updateUsageChart() {
    const ctx = document.getElementById('usageChart').getContext('2d');
    const selectedDay = document.getElementById('daySelector').value;
    const data = generateHourlyUsageData(parseInt(selectedDay));
    
    if (window.usageChart instanceof Chart) {
        window.usageChart.destroy();
    }

    window.usageChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Array.from({length: 24}, (_, i) => `${i}:00`),
            datasets: [{
                label: 'Usage',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Usage'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Hour'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Hourly Usage Trend'
                }
            }
        }
    });
}

//generateHourlyUsageData
function generateHourlyUsageData(day) {
 
    const basePattern = [
        5, 3, 2, 1, 1, 2, // 0-5
        5, 10, 15, 20, 25, 30, // 6-11
        35, 40, 35, 30, 25, 30, // 12-17
        35, 30, 25, 20, 15, 10 // 18-23
    ];

  
    let adjustedPattern;
    if (day >= 0 && day <= 4) { 
        adjustedPattern = basePattern.map(v => v * (1 + Math.random() * 0.2));
    } else { 
        adjustedPattern = basePattern.map(v => v * (0.8 + Math.random() * 0.4));
     
        for (let i = 0; i < 6; i++) adjustedPattern[i] *= 0.5;
        for (let i = 18; i < 24; i++) adjustedPattern[i] *= 1.5;
    }

    return adjustedPattern.map(v => Math.round(v * (0.9 + Math.random() * 0.2)));
}



function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
}

function displayRoute(destination) {
    if (!userLocation) {
        alert('Unable to determine your current location. Please try again.');
        return;
    }

    const request = {
        origin: userMarker.getPosition(),
        destination: destination,
        travelMode: 'DRIVING'
    };

    directionsService.route(request, (result, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
            updateRouteInfo(result.routes[0]);
        } else {
            alert('Could not display directions due to: ' + status);
        }
    });
}


function clearRangeCircle() {
    if (rangeCircle) {
        rangeCircle.setMap(null); // clear map
        rangeCircle = null; // reset as null
    }
}

function calculateRange() {
    clearMarkers();
    clearRoute();

    const address = document.getElementById('rangeAddress').value;
    const vehicle = currentVehicle.name;

    if (!address) {
        alert("Please enter an address.");
        return;
    }

    // clearRangeCircle
    clearRangeCircle();

    // calculate the car range
    fetch('/api/calculate_range', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ address, vehicle })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
            return;
        }

        // shadow effect
        const shadowCircle = new google.maps.Circle({
            map: map,
            center: { lat: data.location.lat, lng: data.location.lng },
            radius: (data.range_km * 1000) + 5000, 
            fillColor: '#000000',
            fillOpacity: 0.1, 
            strokeOpacity: 0,  
        });

      
        rangeCircle = new google.maps.Circle({
            map: map,
            center: { lat: data.location.lat, lng: data.location.lng },
            radius: data.range_km * 1000,  
            fillColor: '#6495ED', 
            fillOpacity: 0.4,
            strokeColor: '#1E90FF',  
            strokeOpacity: 0.7,
            strokeWeight: 3  
        });

      
        map.setCenter({ lat: data.location.lat, lng: data.location.lng });
        map.fitBounds(rangeCircle.getBounds());
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error calculating range.');
    });
}



function getElevationData(path) {
    const elevator = new google.maps.ElevationService();
    const pathRequest = {
        'path': path,
        'samples': 256
    };

    return new Promise((resolve, reject) => {
        elevator.getElevationAlongPath(pathRequest, (results, status) => {
            if (status === 'OK') {
                resolve(results);
            } else {
                reject('Elevation request failed due to: ' + status);
            }
        });
    });
}

function drawElevationChart(elevationData, totalDistance) {
   
    if (elevationChart) {
        elevationChart.destroy();
    }

    const ctx = document.getElementById('elevationChart').getContext('2d');
    const labels = elevationData.map((_, index) => (index / elevationData.length * totalDistance).toFixed(1));
    const data = elevationData.map(point => point.elevation);

    elevationChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Elevation',
                data: data,
                borderColor: 'rgb(60, 179, 113)',
                pointRadius: 0,  
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Distance (km)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Elevation (m)'
                    }
                }
            }
        }
    });
}


function updateElevationDetails(elevationData, route) {
    const details = document.getElementById('elevationDetails');
    const totalDistance = route.legs[0].distance.value / 1000; // km
    const elevations = elevationData.map(point => point.elevation);
    const maxElevation = Math.max(...elevations);
    const minElevation = Math.min(...elevations);
    const elevationGain = elevations.reduce((sum, elevation, index) => {
        if (index > 0 && elevation > elevations[index - 1]) {
            return sum + (elevation - elevations[index - 1]);
        }
        return sum;
    }, 0);

    // Estimating additional battery consumption
    const baseConsumption = 15; 
    const elevationFactor = 0.004; 
    const extraConsumption = (elevationGain / 100) * elevationFactor * baseConsumption;

    details.innerHTML = `
        <p><span class="detail-label">Click on the routes for more information</span></p>
        <!--<p><span class="detail-label">Distance:</span> <span class="detail-value">${totalDistance.toFixed(1)} km</span></p>
        <p><span class="detail-label">Max Elevation:</span> <span class="detail-value">${maxElevation.toFixed(0)} m</span></p>
        <p><span class="detail-label">Min Elevation:</span> <span class="detail-value">${minElevation.toFixed(0)} m</span></p>
        <p><span class="detail-label">Elevation Gain:</span> <span class="detail-value">${elevationGain.toFixed(0)} m</span></p>
        <p><span class="detail-label">Extra Energy Savings due to Elevation:</span> <span class="detail-value">${extraConsumption.toFixed(2)} kWh</span></p>--->
    `;
}



function updateRouteInfo(route, apiData) {
    const routeInfoContent = document.getElementById('routeInfoContent');
    const routeTitle = document.getElementById('routeTitle');
    const routeBreakdown = document.getElementById('routeBreakdown');

 
    function simplifyAddress(address) {
        const parts = address.split(',');
        return parts.slice(0, 2).map(part => part.trim()).join(', ');
    }


    const start = simplifyAddress(route.legs[0].start_address);
    const end = simplifyAddress(route.legs[route.legs.length - 1].end_address);
    routeTitle.innerHTML = `
        <div class="route-title-start">${start}</div>
        <div class="route-title-to">to</div>
        <div class="route-title-end">${end}</div>
    `;

    let breakdownContent = '';
    let totalDistance = 0;
    let totalDuration = 0;

    route.legs.forEach((leg, index) => {
        totalDistance += leg.distance.value;
        totalDuration += leg.duration.value;

        if (index === 0) {
            breakdownContent += `
                <div class="route-point">
                    <i class="fas fa-map-marker-alt"></i>
                    <div>
                        <strong>${leg.start_address}</strong>
                        <p>Departure: ${new Date().toLocaleTimeString()}</p>
                    </div>
                </div>
            `;
        }

        breakdownContent += `
            <div class="route-segment">
                <i class="fas fa-arrow-down"></i>
                <p>${leg.distance.text} - ${leg.duration.text}</p>
            </div>
        `;

        if (apiData?.charging_station && index === 0) {
            breakdownContent += `
                <div class="route-point">
                    <i class="fas fa-charging-station"></i>
                    <div>
                        <strong>${apiData.charging_station.name}</strong>
                        <p>${apiData.charging_station.vicinity}</p>
                    </div>
                </div>
            `;
        }
    });

    breakdownContent += `
        <div class="route-point">
            <i class="fas fa-flag-checkered"></i>
            <div>
                <strong>${route.legs[route.legs.length - 1].end_address}</strong>
                <p>Estimated Arrival: ${calculateArrivalTime(totalDuration)}</p>
            </div>
        </div>
    `;

    routeBreakdown.innerHTML = breakdownContent;

    // Show route information, hide the rest
    ['route', 'stations', 'range'].forEach(id => document.getElementById(id).style.display = 'none');
    routeInfoContent.style.display = 'flex';

        // Get Path Points
        const path = route.overview_path.map(point => ({
            lat: point.lat(),
            lng: point.lng()
        }));
    
        // Getting elevation data
        getElevationData(path).then(elevationData => {
          
            drawElevationChart(elevationData, route.legs[0].distance.value);
            
       
            updateElevationDetails(elevationData, route);
        }).catch(error => {
            console.error('Failed to get elevation data:', error);
        });
}

function calculateArrivalTime(durationInSeconds) {
    const arrivalTime = new Date(Date.now() + durationInSeconds * 1000);
    return arrivalTime.toLocaleTimeString();
}


document.getElementById('closeRouteInfo').addEventListener('click', function() {
    document.getElementById('routeInfoContent').style.display = 'none';
    document.getElementById('route').style.display = 'block';
  
    if (elevationChart) {
        elevationChart.destroy();
        elevationChart = null; 
    }
});


function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function switchTab(tabName, event) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.style.display = 'none');

    const tabButtons = document.querySelectorAll('.tab');
    tabButtons.forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabName).style.display = 'block';
    event.target.classList.add('active');

}

function toggleSettings(settingType) {
    const content = document.getElementById(settingType + 'Settings');
    content.classList.toggle('collapsed');
    
    const icon = document.querySelector('.settings-header i.fas.fa-chevron-down');
    icon.style.transform = content.classList.contains('collapsed') ? 'rotate(0deg)' : 'rotate(180deg)';
}

function openVehicleModal() {
    const modal = document.getElementById('vehicleModal');
    const vehicleList = document.getElementById('vehicleList');
    vehicleList.innerHTML = '';

    vehicles.forEach(vehicle => {
        const vehicleItem = document.createElement('div');
        vehicleItem.className = 'vehicle-item';
        vehicleItem.innerHTML = `
            <img src="${vehicle.image}" alt="${vehicle.name}">
            <span>${vehicle.name}</span>
        `;
        vehicleItem.onclick = () => selectVehicle(vehicle);
        vehicleList.appendChild(vehicleItem);
    });

    modal.style.display = 'block';
}

function closeVehicleModal() {
    document.getElementById('vehicleModal').style.display = 'none';
}

function selectVehicle(vehicle) {
    currentVehicle = vehicle;
    updateSelectedVehicle();
    closeVehicleModal();
}

function updateSelectedVehicle() {
    const selectedVehicle = document.getElementById('selectedVehicle');
    selectedVehicle.innerHTML = `
        <img src="${currentVehicle.image}" alt="${currentVehicle.name}">
        ${currentVehicle.name}
        <button onclick="openVehicleModal()" class="refresh-button">
            ↺
        </button>
    `;
}


function clearAllMarkers() {
  
    clearMarkers();
    
  
    if (startMarker) {
        startMarker.setMap(null);
        startMarker = null;
    }
    
  
    if (endMarker) {
        endMarker.setMap(null);
        endMarker = null;
    }
    
 
    if (userMarker) {
        userMarker.setMap(null);
        userMarker = null;
    }
    
 
       // Clear the route
    if (directionsRenderer) {
        directionsRenderer.setDirections({routes: []});
    } else {
        console.warn('directionsRenderer is not initialized');
    }
}


function clearRoute() {

    if (directionsRenderers && directionsRenderers.length > 0) {
        // Loop through all directions renderers and clear the map for each
        directionsRenderers.forEach(renderer => {
            renderer.setMap(null);  // Remove the renderer from the map
        });

        // Clear the array after removing all renderers
        directionsRenderers = [];
    }
    // if (directionsRenderer) {
    //     directionsRenderer.setDirections({ routes: [] });
    // }
}

function showLoadingOverlay() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.style.display = 'flex';
}

function hideLoadingOverlay() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.style.display = 'none'; 
}

function planRoute() {
    showLoadingOverlay();

    // Clear existing routes and markers
    clearRoute();
    clearMarkers();
    clearRangeCircle();
    clearAllMarkers();

    const startPoint = document.getElementById('startPoint').value;
    const destination = document.getElementById('destination').value;
    const batteryDeparture = parseInt(document.getElementById('batteryDeparture').value);
    const batteryArrival = parseInt(document.getElementById('batteryArrival').value);

    if (!startPoint || !destination) {
        alert('Please enter both start point and destination.');
        hideLoadingOverlay();
        return;
    }

    const routeData = {
        start: startPoint,
        destination: destination,
        vehicle: currentVehicle.name,
        batteryDeparture: batteryDeparture,
        batteryArrival: batteryArrival
    };

    fetch('/api/plan_route', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(routeData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Route planned:', data);

        // Create a LatLngBounds object to adjust the map view
        const bounds = new google.maps.LatLngBounds();

        data.routes_info.forEach((routeInfo) => {
            if (routeInfo.route && routeInfo.route.overview_polyline) {
                // Decode the polyline into an array of LatLng points
                const decodedPath = google.maps.geometry.encoding.decodePath(routeInfo.route.overview_polyline.points);
                
                // Extend the bounds to include all points in the decoded path
                decodedPath.forEach(point => {
                    bounds.extend(point);
                });
            } else {
                console.error('Overview polyline data is missing for this route:', routeInfo);
            }

            if (routeInfo.charging_station) {
                handleRoutesWithChargingStationAlternatives();
            } else {
                handleRoutesWithoutChargingStationAlternatives(routeInfo, startPoint, destination);
            }
        });

        // Adjust the map to fit the bounds of the entire route
        map.fitBounds(bounds);

        setTimeout(() => {
            hideLoadingOverlay();
        }, 3000);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while planning the route. Please try again.');
    });
}


function handleRoutesWithoutChargingStationAlternatives(routeInfo, startPoint, destination) {
    const directionsRequest = {
        origin: startPoint,
        destination: destination,
        travelMode: 'DRIVING',
        provideRouteAlternatives: true // Request alternative routes explicitly
    };

    directionsService.route(directionsRequest, (result, status) => {
        if (status === 'OK') {
            let maxEnergySavedIndex = 0;
            let maxEnergySaved = 0;

            // Loop through each alternative route to pre-calculate energy savings
            const energySavingsPromises = result.routes.map((route, routeIndex) => {
                const path = route.overview_path;

                // Ensure routeInfo[routeIndex] is properly initialized
                if (!routeInfo[routeIndex]) {
                    routeInfo[routeIndex] = {}; // Initialize it if undefined
                }

                return getElevationData(path).then(elevationData => {
                    const energySavedPercentage = calculateEnergySaved(elevationData); // Calculate energy savings
                    routeInfo[routeIndex].elevationData = elevationData;
                    routeInfo[routeIndex].energy_saved_percentage = energySavedPercentage;

                    // Keep track of the route with the highest energy savings
                    if (energySavedPercentage > maxEnergySaved) {
                        maxEnergySaved = energySavedPercentage;
                        maxEnergySavedIndex = routeIndex;
                    }
                    return energySavedPercentage;
                });
            });

            // Once all energy savings are calculated, draw the polylines with appropriate colors
            Promise.all(energySavingsPromises).then(() => {
                result.routes.forEach((route, routeIndex) => {
                    const path = route.overview_path;
                    const routeColor = (routeIndex === maxEnergySavedIndex) ? '#28a745' : '#FFA500'; // Green for highest, red for others

                    // Create the polyline for each route
                    const polyline = new google.maps.Polyline({
                        path: path,
                        strokeColor: routeColor,
                        strokeOpacity: 1.0,
                        strokeWeight: 6,
                        map: map  // Display the polyline on the map
                    });

                    // Attach click event listener to each polyline to display elevation data
                    polyline.addListener('click', () => {
                        console.log(`Clicked on route index: ${routeIndex}`);
                        const totalDistance = route.legs.reduce((sum, leg) => sum + leg.distance.value, 0) / 1000; // Convert to km
                        openRouteModal(routeInfo[routeIndex], totalDistance); // Open modal with the correct data
                    });

                    directionsRenderers.push(polyline); // Store polyline reference
                    updateRouteInfo(route, routeInfo[routeIndex]); // Update the route information display
                    addMarkersToMap(route, routeInfo[routeIndex]); // Add markers for each route
                });
            }).catch(error => {
                console.error('Error while fetching elevation data:', error);
            });
        } else {
            alert('Could not display directions due to: ' + status);
        }
    });
}



// Function to calculate energy saved based on elevation data
function calculateEnergySaved(elevationData) {
    let totalEnergySavedPercentage = 0;
    let totalElevationGain = 0;
    let totalElevationLoss = 0;

    for (let i = 1; i < elevationData.length; i++) {
        const elevationDiff = elevationData[i].elevation - elevationData[i - 1].elevation;

        if (elevationDiff < 0) {  // Downhill sections recover energy
            totalElevationLoss += Math.abs(elevationDiff);
        } else {  // Uphill sections consume more energy
            totalElevationGain += elevationDiff;
        }
    }

    // Approximate savings: energy saved on downhill as a percentage of the total
    if (totalElevationGain + totalElevationLoss > 0) {
        totalEnergySavedPercentage = (totalElevationLoss / (totalElevationGain + totalElevationLoss)) * 100;
    }

    return totalEnergySavedPercentage;
}


// Function to handle routes with charging stations and provide route alternatives
function handleRoutesWithChargingStationAlternatives() {
    showLoadingOverlay();

    // Clear existing routes and markers
    clearRoute();  // Ensure all previous routes are cleared
    clearMarkers();
    clearRangeCircle();

    const startPoint = document.getElementById('startPoint').value;
    const destination = document.getElementById('destination').value;
    const batteryDeparture = parseInt(document.getElementById('batteryDeparture').value);
    const batteryArrival = parseInt(document.getElementById('batteryArrival').value);

    if (!startPoint || !destination) {
        alert('Please enter both start point and destination.');
        hideLoadingOverlay();
        return;
    }

    const routeData = {
        start: startPoint,
        destination: destination,
        vehicle: currentVehicle.name,
        batteryDeparture: batteryDeparture,
        batteryArrival: batteryArrival
    };

    fetch('/api/plan_route', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(routeData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Route planned:', data);

        let maxEnergySavedIndex = 0;
        let maxEnergySaved = 0;

        // Loop through each alternative route to pre-calculate energy savings
        const energySavingsPromises = data.routes_info.map((routeInfo, index) => {
            const directionsRequest = {
                origin: startPoint,
                destination: destination,
                travelMode: 'DRIVING',
                provideRouteAlternatives: true
            };

            if (routeInfo.charging_station) {
                directionsRequest.waypoints = [{
                    location: new google.maps.LatLng(
                        routeInfo.charging_station.location.lat,
                        routeInfo.charging_station.location.lng
                    ),
                    stopover: true
                }];
            }

            return new Promise((resolve, reject) => {
                directionsService.route(directionsRequest, (result, status) => {
                    if (status === 'OK') {
                        const path = result.routes[0].overview_path;

                        // Fetch elevation data for the route
                        getElevationData(path).then(elevationData => {
                            const energySavedPercentage = calculateEnergySaved(elevationData); // Calculate energy savings
                            routeInfo.elevationData = elevationData;
                            routeInfo.energy_saved_percentage = energySavedPercentage;

                            // Keep track of the route with the highest energy savings
                            if (energySavedPercentage > maxEnergySaved) {
                                maxEnergySaved = energySavedPercentage;
                                maxEnergySavedIndex = index;
                            }

                            resolve({ routeInfo, path, result });
                        }).catch(error => {
                            console.error('Failed to get elevation data:', error);
                            reject(error);
                        });
                    } else {
                        console.error('Could not display directions due to:', status);
                        reject(status);
                    }
                });
            });
        });

        // Once all energy savings are calculated, draw the polylines with appropriate colors
        Promise.all(energySavingsPromises).then(routesData => {
            routesData.forEach(({ routeInfo, path, result }, index) => {
                const routeColor = (index === maxEnergySavedIndex) ? '#28a745' : '#FFA500'; // Green for highest, red for others

                // Create the polyline for each route
                const polyline = new google.maps.Polyline({
                    path: path,
                    strokeColor: routeColor,
                    strokeOpacity: 1.0,
                    strokeWeight: 6,
                    map: map  // Display the polyline on the map
                });

                // Add event listener to display modal with elevation data and energy saved
                polyline.addListener('click', () => {
                    console.log(`Clicked on route index: ${index}`);
                    const totalDistance = result.routes[0].legs.reduce((sum, leg) => sum + leg.distance.value, 0) / 1000; // Convert to km
                    openRouteModal(routeInfo, totalDistance); // Display the modal with elevation and energy saved data
                });

                directionsRenderers.push(polyline);
                updateRouteInfo(result.routes[0], routeInfo);
                addMarkersToMap(result.routes[0], routeInfo);
            });

            setTimeout(() => {
                hideLoadingOverlay();
            }, 3000);
        }).catch(error => {
            console.error('Error while fetching elevation data:', error);
            hideLoadingOverlay();
        });
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while planning the route. Please try again.');
        hideLoadingOverlay();
    });
}






// Function to add markers to the map (start, end, and charging station)
function addMarkersToMap(route, routeInfo) {
    // 1. Start Marker
    const startIcon = {
        url: 'static/images/car.png',
        scaledSize: new google.maps.Size(40, 40),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(20, 20)
    };
    const startMarker = new google.maps.Marker({
        position: route.legs[0].start_location,
        map: map,
        icon: startIcon,
        title: 'Start Point'
    });
    markers.push(startMarker);

    // 2. End Marker
    const endIcon = {
        url: 'static/images/destination-icon.png',
        scaledSize: new google.maps.Size(40, 40),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(20, 20)
    };
    const endMarker = new google.maps.Marker({
        position: route.legs[route.legs.length - 1].end_location,
        map: map,
        icon: endIcon,
        title: 'End Point'
    });
    markers.push(endMarker);

    // 3. Charging Station Marker (if applicable)
    if (routeInfo.charging_station) {
        const chargingStationIcon = {
            url: 'static/images/charging-station.png',
            scaledSize: new google.maps.Size(35, 35),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 17)
        };
        const chargingMarker = new google.maps.Marker({
            position: new google.maps.LatLng(
                routeInfo.charging_station.location.lat,
                routeInfo.charging_station.location.lng
            ),
            map: map,
            icon: chargingStationIcon,
            title: routeInfo.charging_station.name
        });
        markers.push(chargingMarker);
    }
}





// Function to open the modal and display elevation and energy savings details for a route
function openRouteModal(routeInfo, totalDistance) {
    console.log("Distance", totalDistance);
    console.log("Elevation Data", routeInfo.elevationData);

    // Populate the modal with the elevation chart and energy savings details
    const modal = document.getElementById('routeModal');
    modal.style.display = 'block';

    // Draw the elevation chart for the clicked route
    drawElevationChart(routeInfo.elevationData, totalDistance);

    // Show the energy savings percentage for the clicked route with the leaf icon
    document.getElementById('energySavings').innerHTML = `
        <div style="margin-top: 15px; font-size: 16px; display: flex; align-items: center;">
            <i class="fas fa-leaf text-success" style="color: green; margin-right: 8px;"></i>
            <span>Choosing this route could help you save up to <strong>${routeInfo.energy_saved_percentage.toFixed(2)}% </strong>in energy consumption compared to other available routes.</span>
        </div>
    `;
}


function closeRouteModal() {
    const modal = document.getElementById('routeModal');
    modal.style.display = 'none';

    // Clear the elevation chart if it exists
    if (elevationChart) {
        elevationChart.destroy();
        elevationChart = null;  // Reset the chart
    }

    // Clear the energy savings display
    document.getElementById('energySavings').innerText = '';
}





function searchStationsAlongRoute(legs) {


    legs.forEach(leg => {
        const lat = leg.start_location.lat();
        const lng = leg.start_location.lng();
        getChargingStations(lat, lng);
    });
}

function validateBatteryDeparture(input) {
    let value = parseInt(input.value);
    if (isNaN(value) || value < 1) value = 1;
    if (value > 100) value = 100;
    input.value = value;
}

function validateBatteryArrival(input) {
    let value = parseInt(input.value);
    if (isNaN(value) || value < 1) value = 1;
    if (value > 100) value = 100;
    input.value = value;
}


// Try to get the location after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {

    getUserLocation();


    const planRouteTab = document.querySelector('button[onclick="switchTab(\'route\', event)"]');
    if (planRouteTab) {
        planRouteTab.click();  // Simulate clicking on the Plan route tab to ensure that the content is displayed
    }
});

