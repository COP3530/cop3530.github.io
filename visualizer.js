let map;
let locations = {}; // { locationId: { lat, lng, name } }
let paths = [];     // [ { from, to, time } ]
let toggledOffPathKeys = new Set(); // Stores "from-to" strings of disabled paths
let showWeights = true; // Toggle for weight visibility

// --- CONFIGURATION ---
let useMonotoneBlue = false; // Toggle switch for monotone edges
const strongColors = [
    '#E6194B', // Bold Red
    '#3CB44B', // Deep Green
    '#F58231', // Vibrant Orange
    '#911EB4', // Strong Purple
    '#4363D8', // Bright Blue
    '#800000', // Maroon
    '#000075', // Navy
    '#F032E6'  // Magenta
];

function initializeMap() {
    map = L.map('map').setView([29.64833, -82.34944], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

/**
 * Parses raw CSV text into an array of objects.
 */
function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return []; 

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
        // Fetch only locations and edges. colors.csv is no longer needed.
        const [locationsResponse, pathsResponse] = await Promise.all([
            fetch('locations.csv'),
            fetch('edges.csv')
        ]);

        if (!locationsResponse.ok) throw new Error(`Failed to load locations.csv`);
        if (!pathsResponse.ok) throw new Error(`Failed to load edges.csv`);

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
        alert(`Failed to load master graph files: ${error.message}\n\nPlease ensure the files exist in the same directory as the HTML file.`);
    }
}

function drawMap() {
    map.eachLayer(layer => {
        if (layer instanceof L.Path || layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    if (Object.keys(locations).length === 0) return;

    // Draw Location Markers (Nodes) - Reduced size and removed ID text for decluttering
    for (const id in locations) {
        const loc = locations[id];
        const icon = L.divIcon({
            className: 'location-marker-icon',
            html: `${id}`, 
            iconSize: [20, 20], 
            iconAnchor: [6, 6]
        });
        L.marker([loc.lat, loc.lng], { icon: icon }).addTo(map)
            .bindPopup(`<b>${loc.name}</b><br>ID: ${id}`);
    }

    paths.forEach((path, index) => {
        const fromLoc = locations[path.from];
        const toLoc = locations[path.to];
        const pathKey = `${path.from}-${path.to}`;
        const reversePathKey = `${path.to}-${path.from}`;

        if (fromLoc && toLoc) {
            const latlngs = [[fromLoc.lat, fromLoc.lng], [toLoc.lat, toLoc.lng]];
            const isToggledOff = toggledOffPathKeys.has(pathKey);

            // Determine edge color dynamically
            let edgeColor;
            if (isToggledOff) {
                edgeColor = '#FF0000'; // Red for disabled
            } else if (useMonotoneBlue) {
                edgeColor = '#0000FF'; // Standard Monotone Blue
            } else {
                edgeColor = strongColors[index % strongColors.length]; // Cycle through palette
            }

            const baseWeight = 3; // Thinner lines
            const baseOpacity = 0.8;

            const style = {
                color: edgeColor,
                weight: baseWeight,
                opacity: baseOpacity
            };

            const polyline = L.polyline(latlngs, style).addTo(map);
            
            // Correct Leaflet Implementation for Hover Animations
            polyline.on('mouseover', function(e) {
                e.target.setStyle({ weight: 7, opacity: 1 });
            });
            polyline.on('mouseout', function(e) {
                e.target.setStyle({ weight: baseWeight, opacity: baseOpacity });
            });
            
            // Toggle edges on click
            polyline.on('click', () => {
                if (toggledOffPathKeys.has(pathKey)) {
                    toggledOffPathKeys.delete(pathKey);
                    toggledOffPathKeys.delete(reversePathKey);
                } else {
                    toggledOffPathKeys.add(pathKey);
                    toggledOffPathKeys.add(reversePathKey);
                }
                drawMap(); 
            });
            
            // Sticky Tooltip (follows the mouse along the line)
            polyline.bindTooltip(`${path.from} → ${path.to}, ${path.time} Minutes`, {
                permanent: false,
                direction: 'top',
                className: 'edge-tooltip',
                offset: [0, -10],
                sticky: true
            });

            // Permanent weight badges (Only show when zoomed in far enough to avoid clutter)
            const currentZoom = map.getZoom();
            if (!isToggledOff && showWeights && currentZoom > 16) {
                const midpoint = polyline.getCenter();
                
                const weightIcon = L.divIcon({
                    className: 'edge-weight-label',
                    html: `<span style="background: rgba(255,255,255,0.9); padding: 3px 6px; border-radius: 6px; font-size: 11px; font-weight: bold; box-shadow: 0 1px 3px rgba(0,0,0,0.3); border: 2px solid ${edgeColor}; color: ${edgeColor};">${path.time}</span>`,
                    iconSize: [18, 18],
                    iconAnchor: [5, 5]
                });
                
                L.marker([midpoint.lat, midpoint.lng], { icon: weightIcon, interactive: false }).addTo(map);
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializeMap();
    loadMasterGraph();
    
    // Redraw on zoom so the permanent weight labels appear/disappear based on zoom level
    map.on('zoomend', () => {
        drawMap();
    });
    
    // Checkboxes for UI logic
    const weightToggle = document.getElementById('weightToggle');
    if (weightToggle) {
        weightToggle.addEventListener('change', (e) => {
            showWeights = e.target.checked;
            drawMap();
        });
    }

    // Toggle button for turning everything Monotone Blue
    const colorToggle = document.getElementById('colorToggle');
    if (colorToggle) {
        colorToggle.addEventListener('click', () => {
            useMonotoneBlue = !useMonotoneBlue;
            drawMap();
        });
    }
});