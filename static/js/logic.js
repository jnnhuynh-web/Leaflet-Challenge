// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Perform a GET request to the query URL using D3
d3.json(queryUrl, function(data) {
    // Once we get a response, send the data.features object from queryUrl to the createPopup function
    createPopup(data.features);
});

// Function to create the popups
function createPopup(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature
    });

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
} // createPopup function ends here


// function to create the map and layers (function spans the rest of the file)
function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    // Streetmap layer
    var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: API_KEY
    });
    // Darkmap layer
    var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.dark",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Street Map": streetmap,
        "Dark Map": darkmap
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
            36, -120
        ],
        zoom: 5,
        layers: [streetmap, earthquakes]
    });


    // CREATE LEGEND
    // legend colors   
    function getColor(d) {
        return d > 4 ? "DarkRed" :
            d > 3 ? 'Red' :
            d > 2 ? 'Orange' :
            d > 1.5 ? 'Yellow' :
            d > 0.75 ? 'Green' :
            'DarkOliveGreen';
    };
    // Adding legend
    var legend = L.control({
        position: 'bottomright'
    });
    legend.onAdd = function(map) {
        //Defining legend intervals
        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 0.75, 1.5, 2, 3, 4],
            labels = [];

        // loop through our intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + .5) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };
    legend.addTo(myMap);


    // Functions to create the earthquake points
    // Perform a GET request to the query URL using D3
    d3.json(queryUrl, function(data) {
        // Once we get a response, send the data.features object from queryUrl to the createFeature function
        createFeature(data.features);
    });

    // createFeature function for circles
    function createFeature(earthquakeData) {
        console.log(earthquakeData)

        for (var i = 0; i < earthquakeData.length; i++) {
            // getColor function for circle colours
            function getColor(d) {
                return d > 4 ? "DarkRed" :
                    d > 3 ? 'Red' :
                    d > 2 ? 'Orange' :
                    d > 1.5 ? 'Yellow' :
                    d > 0.75 ? 'Green' :
                    'DarkOliveGreen';
            };
            //create the circle markers
            var circle = L
                .circle([earthquakeData[i].geometry.coordinates[1], earthquakeData[i].geometry.coordinates[0]], {
                    color: getColor(earthquakeData[i].properties.mag),
                    opacity: 0.5,
                    fillColor: getColor(earthquakeData[i].properties.mag),
                    fillOpacity: 0.5,
                    radius: earthquakeData[i].properties.mag * 30000
                })
                .addTo(myMap);
        }
    } // end of createFeature function

    // Create overlay object to hold our overlay layer for the earthquake points
    var overlayMaps = {
        "Earthquake Popup": earthquakes,
    };
    // Create a layer for the control panel by passing in our baseMaps and overlayMaps
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
};