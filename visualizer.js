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

// Fixed parameters for edge avoidance
let nodeBuffer = 0.0003; // Buffer distance around nodes to avoid
let detourMultiplier = 1.5; // Multiplier for detour distance
let edgeOpacity = 1; // Edge opacity

function initializeMap() {
    map = L.map('map').setView([29.64833, -82.34944], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20, // Allow zooming up to level 20 (much closer than default 18)
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

function findAvoidancePath(fromLoc, toLoc, currentPathKey) {
    const buffer = nodeBuffer; // Use tunable parameter
    const stepSize = 0.0001; // Step size for pathfinding
    
    // Check if straight line intersects any nodes (except start/end)
    const straightPath = [[fromLoc.lat, fromLoc.lng], [toLoc.lat, toLoc.lng]];
    let hasCollision = false;
    
    for (const nodeId in locations) {
        if (nodeId === fromLoc.toString() || nodeId === toLoc.toString()) continue;
        
        const nodeLoc = locations[nodeId];
        if (lineIntersectsNode(straightPath[0], straightPath[1], [nodeLoc.lat, nodeLoc.lng], buffer)) {
            hasCollision = true;
            break;
        }
    }
    
    // If no collision, return straight path
    if (!hasCollision) {
        return straightPath;
    }
    
    // Calculate detour path around obstacles
    const midLat = (fromLoc.lat + toLoc.lat) / 2;
    const midLng = (fromLoc.lng + toLoc.lng) / 2;
    
    // Try multiple detour angles
    const detourAngles = [Math.PI/4, -Math.PI/4, Math.PI/3, -Math.PI/3];
    let bestPath = straightPath;
    let minCollisions = Infinity;
    
    for (const angle of detourAngles) {
        // Calculate detour waypoint
        const detourLat = midLat + Math.cos(angle) * buffer * detourMultiplier;
        const detourLng = midLng + Math.sin(angle) * buffer * detourMultiplier;
        
        const detourPath = [
            [fromLoc.lat, fromLoc.lng],
            [detourLat, detourLng],
            [toLoc.lat, toLoc.lng]
        ];
        
        // Count collisions for this detour
        let collisionCount = 0;
        for (const nodeId in locations) {
            if (nodeId === fromLoc.toString() || nodeId === toLoc.toString()) continue;
            
            const nodeLoc = locations[nodeId];
            if (lineIntersectsNode([fromLoc.lat, fromLoc.lng], [detourLat, detourLng], [nodeLoc.lat, nodeLoc.lng], buffer) ||
                lineIntersectsNode([detourLat, detourLng], [toLoc.lat, toLoc.lng], [nodeLoc.lat, nodeLoc.lng], buffer)) {
                collisionCount++;
            }
        }
        
        if (collisionCount < minCollisions) {
            minCollisions = collisionCount;
            bestPath = detourPath;
        }
    }
    
    return bestPath;
}

function lineIntersectsNode(lineStart, lineEnd, nodePos, buffer) {
    // Simple distance check from node to line segment
    const A = nodePos[0] - lineStart[0];
    const B = nodePos[1] - lineStart[1];
    const C = lineEnd[0] - lineStart[0];
    const D = lineEnd[1] - lineStart[1];
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) {
        param = dot / lenSq;
    }
    
    let xx, yy;
    
    if (param < 0) {
        xx = lineStart[0];
        yy = lineStart[1];
    } else if (param > 1) {
        xx = lineEnd[0];
        yy = lineEnd[1];
    } else {
        xx = lineStart[0] + param * C;
        yy = lineStart[1] + param * D;
    }
    
    const dx = nodePos[0] - xx;
    const dy = nodePos[1] - yy;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < buffer;
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
            // Calculate smart path that avoids nodes and other edges
            const latlngs = findAvoidancePath(fromLoc, toLoc, pathKey);
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
            colorToggle.textContent = useMonotoneBlue ? 'Use Colored Edges' : 'Use Monotone Blue';
            colorToggle.style.background = useMonotoneBlue ? '#e6f3ff' : '#f0f0f0';
            drawMap();
        });
    }
});