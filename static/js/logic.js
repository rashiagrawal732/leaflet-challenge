// Define URLs for earthquake and tectonic plates data
const earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
const tectonicPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
 
// Initialize LayerGroups
let earthquakes = new L.LayerGroup();
let tectonicPlates = new L.LayerGroup();
 
// Define tile layers
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
 
let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});
 
let satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});
 
// Define baseMaps object
let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo,
    "Satellite": satellite
};
 
// Define an overlay object
let overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicPlates
};
 
// Create map object
let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [street, earthquakes, tectonicPlates]
});
 
// Add layer control to map
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(myMap);
 
// Function to determine marker size based on magnitude
function markerSize(magnitude) {
    return magnitude * 4;
}
 
// Function to determine marker color based on depth
function chooseColor(depth) {
    if (depth > 90) return "#d73027"
    else if (depth > 70) return "#fc8d59"
    else if (depth > 50) return "#fee08b"
    else if (depth > 30) return "#d9ef8b"
    else if (depth > 10) return "#91cf60"
    else return "#1a9850";
}
 
// Create legend
let legend = L.control({position: 'bottomright'});
 
legend.onAdd = function () {
    let div = L.DomUtil.create('div', 'legend');
    let depths = [-10, 10, 30, 50, 70, 90];
    let colors = ['#1a9850', '#91cf60', '#d9ef8b', '#fee08b', '#fc8d59', '#d73027'];
 
    div.innerHTML += '<h4>Earthquake Depth</h4>';
 
    // Loop through depths and create a label with a colored square for each interval
    for (let i = 0; i < depths.length; i++) {
        div.innerHTML +=
            '<i style="background: ' + colors[i] + '"></i> ' +
            depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + ' km<br>' : '+ km');
    }
 
    return div;
};
 
legend.addTo(myMap);
 
// Get earthquake data
d3.json(earthquakeURL).then(function(earthquakeData) {
    // Create a GeoJSON layer containing the features array
    L.geoJSON(earthquakeData, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: markerSize(feature.properties.mag),
                fillColor: chooseColor(feature.geometry.coordinates[2]),
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        },
        onEachFeature: function(feature, layer) {
            layer.bindPopup(`
                <h3>${feature.properties.place}</h3>
                <hr>
                <p>Magnitude: ${feature.properties.mag}</p>
                <p>Depth: ${feature.geometry.coordinates[2]} km</p>
                <p>Time: ${new Date(feature.properties.time).toLocaleString()}</p>
            `);
        }
    }).addTo(earthquakes);
 
    // Get tectonic plates data
    d3.json(tectonicPlatesURL).then(function(platesData) {
        // Create a GeoJSON layer with the retrieved data
        L.geoJSON(platesData, {
            color: "#ff6500",
            weight: 2
        }).addTo(tectonicPlates);
    });
}).catch(function(error) {
    console.log("Error:", error);
});
