// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.
let map, infoWindow, poly
const start = { lat: 51.332, lng: 12.372 }
const drawRate = 500
const mapStyles = {
    default: [],
    hide: [
        {
            featureType: "poi.business",
            stylers: [{ visibility: "off" }],
        },
        {
            featureType: "transit",
            elementType: "labels.icon",
            stylers: [{ visibility: "off" }],
        },
    ],
};

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: start,
        zoom: 18,
        mapTypeId: "terrain",
        disableDefaultUI: true,
    })
    map.setOptions({ styles: mapStyles["hide"] });

    poly = new google.maps.Polyline({
        geodesic: true,
        strokeColor: "#0000FF",
        strokeOpacity: 1.0,
        strokeWeight: 8,
    });
    poly.setMap(map);

    const loadButton = document.getElementById('loadButton')
    loadButton.addEventListener("click", () => {
        fetch('http://dabpi.local:3001/load', {
            method: 'GET'
        })
            .then(response => response.json())
            .then(data => {
                const path = poly.getPath()
                path.pop()
                path.push(latlong)
            })
            .catch((error) => {
                console.error('Error fetching logfile:', error)
            })
    })

    const clearButton = document.getElementById('loadButton')
    clearButton.addEventListener("click", () => {
        const path = poly.getPath()
        path.length = 0
    })

    infoWindow = new google.maps.InfoWindow()
    const locationButton = document.getElementById('locationButton')
    locationButton.addEventListener("click", () => {
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    }
                    new google.maps.Marker({
                        position: pos,
                        map: map,
                    })
                    map.setCenter(pos)
                },
                () => {
                    handleLocationError(true, infoWindow, map.getCenter())
                }
            )
        } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, infoWindow, map.getCenter())
        }
    })
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos)
    infoWindow.setContent(
        browserHasGeolocation
            ? "Error: The Geolocation service failed."
            : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map)
}

let intervalID = window.setInterval(getGps, drawRate)
function getGps() {
    fetch('http://dabpi.local:3001/get', {
        method: 'GET'
    })
        .then(response => response.json())
        .then(data => {
            let latlong = new google.maps.LatLng(parseFloat(data.lat), parseFloat(data.lng));
            const path = poly.getPath()
            path.push(latlong)
        })
        .catch((error) => {
            console.error('Error fetching GPS data:', error)
        })
}

function clearMvc(mvc) {
    for (i = 0; i < mvc.getLength(); i++){
        mvc.removeAt(i);
    }
}

