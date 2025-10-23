let map;
let locations = {}; // { locationId: { lat, lng, name } }
let paths = [];     // [ { from, to, time } ]
let toggledOffPathKeys = new Set(); // Stores "from-to" strings of disabled paths

function initializeMap() {
    map = L.map('map').setView([29.64833, -82.34944], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

/**
 * Parses raw CSV text into an array of objects.
 * @param {string} text The raw CSV string.
 * @returns {Array<Object>} An array of objects representing the rows.
 */
function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return []; // Return empty if no data rows

    const header = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        let obj = {};
        header.forEach((col, index) => {
            obj[col] = values[index];
        });
        return obj;
    });
    return rows;
}

async function loadMasterGraph() {
    try {
        const [locationsResponse, pathsResponse] = await Promise.all([
            fetch('locations.csv'),
            fetch('edges.csv')
        ]);

        if (!locationsResponse.ok) throw new Error(`Failed to load locations.csv: ${locationsResponse.statusText}`);
        if (!pathsResponse.ok) throw new Error(`Failed to load edges.csv: ${pathsResponse.statusText}`);

        const locationsText = await locationsResponse.text();
        const pathsText = await pathsResponse.text();

        const locationsData = parseCSV(locationsText);
        locations = {}; 
        locationsData.forEach(row => {
            if (row.LocationID && row.Latitude && row.Longitude) {
                locations[row.LocationID] = {
                    name: row.Name || 'Unnamed Location',
                    lat: parseFloat(row.Latitude),
                    lng: parseFloat(row.Longitude)
                };
            }
        });

        const pathsData = parseCSV(pathsText);
        paths = [];
        pathsData.forEach(row => {
            if (row.LocationID_1 && row.LocationID_2 && row.Time) {
                paths.push({
                    from: row.LocationID_1,
                    to: row.LocationID_2,
                    time: parseInt(row.Time, 10)
                });
            }
        });
        
        toggledOffPathKeys.clear();

        console.log("Master graph data loaded successfully from local files.");
        drawMap();

    } catch (error) {
        console.error("Failed to load master graph:", error);
        alert(`Failed to load master graph files (locations.csv, paths.csv): ${error.message}\n\nPlease ensure the files exist in the same directory as the HTML file.`);
    }
}

function drawMap() {
    // Clear previous layers (everything except the base map tiles)
    map.eachLayer(layer => {
        if (layer instanceof L.Path || layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    if (Object.keys(locations).length === 0) return;

    // Draw Location Markers (Nodes)
    for (const id in locations) {
        const loc = locations[id];
        const icon = L.divIcon({
            className: 'location-marker-icon',
            html: `<div>${id}</div>`, 
            iconSize: [28, 28], 
            iconAnchor: [14, 14]
        });
        L.marker([loc.lat, loc.lng], { icon: icon }).addTo(map)
            .bindPopup(`<b>${loc.name}</b><br>ID: ${id}`);
    }

    paths.forEach(path => {
        const fromLoc = locations[path.from];
        const toLoc = locations[path.to];
        const pathKey = `${path.from}-${path.to}`;
        const reversePathKey = `${path.to}-${path.from}`;

        if (fromLoc && toLoc) {
            const latlngs = [[fromLoc.lat, fromLoc.lng], [toLoc.lat, toLoc.lng]];
            
            const isToggledOff = toggledOffPathKeys.has(pathKey);

            let edgeColor = '#0000FF'; // Default blue
            if (isToggledOff) {
                edgeColor = '#FF0000'; // Red for disabled
            }

            const style = {
                color: edgeColor,
                weight: 4,
            };

            const polyline = L.polyline(latlngs, style).addTo(map);
            
            // Add click handler to toggle the edge's "disabled" state
            polyline.on('click', () => {
                if (toggledOffPathKeys.has(pathKey)) {
                    toggledOffPathKeys.delete(pathKey);
                    toggledOffPathKeys.delete(reversePathKey);
                } else {
                    toggledOffPathKeys.add(pathKey);
                    toggledOffPathKeys.add(reversePathKey);
                }
                drawMap(); // Redraw to reflect the change
            });
            
            if (!isToggledOff) {
                const weightIcon = L.divIcon({
                    className: 'edge-weight-label',
                    html: `<span>${path.time}</span>`
                });
                L.marker(polyline.getCenter(), { icon: weightIcon }).addTo(map);
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializeMap();
    loadMasterGraph();
});