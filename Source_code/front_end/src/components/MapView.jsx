import {
    MapContainer,
    TileLayer,
    Marker,
    Polyline,
    useMapEvents,
    useMap,
    Popup,
} from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";

// ✅ Configuration correcte des icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// 🎨 Icônes personnalisées
const participantIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const midpointIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const tempIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

// 🖱️ Gestionnaire de clics sur la carte
function ClickHandler({ onLocationSelect }) {
    useMapEvents({
        click(e) {
            console.log("Map clicked at:", e.latlng); // Debug
            onLocationSelect(e.latlng);
        },
    });
    return null;
}

// 🔍 Hook pour zoomer automatiquement sur tous les markers
function ZoomToBounds({ participants, midpoint, selectedLocation }) {
    const map = useMap();

    useEffect(() => {
        const bounds = [];

        participants.forEach((p) => {
            if (p.lat && p.lng) {
                bounds.push([p.lat, p.lng]);
            }
        });

        if (midpoint && midpoint.lat && midpoint.lng) {
            bounds.push([midpoint.lat, midpoint.lng]);
        }

        if (selectedLocation && selectedLocation.lat && selectedLocation.lng) {
            bounds.push([selectedLocation.lat, selectedLocation.lng]);
        }

        if (bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
    }, [participants, midpoint, selectedLocation, map]);

    return null;
}

// 🗺️ Composant principal de la carte
function MapView({ participants, midpoint, selectedLocation, onLocationSelect }) {
    console.log("MapView render:", { participants, midpoint, selectedLocation }); // Debug

    return (
        <MapContainer
            center={[42.355, -71.105]}
            zoom={12}
            style={{
                flex: 1,
                height: "100%",
                width: "100%",
                minHeight: "400px",
            }}
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <ClickHandler onLocationSelect={onLocationSelect} />

            <ZoomToBounds
                participants={participants}
                midpoint={midpoint}
                selectedLocation={selectedLocation}
            />

            {/* 👥 Marqueurs des participants */}
            {participants.map((p) => {
                if (!p.lat || !p.lng) return null;
                return (
                    <Marker
                        key={p.id}
                        position={[p.lat, p.lng]}
                        icon={participantIcon}
                    >
                        <Popup>
                            <strong>
                                {p.firstName} {p.lastName}
                            </strong>
                            <br />
                            Activity: {p.activity}
                            <br />
                            <small>
                                {p.lat.toFixed(4)}, {p.lng.toFixed(4)}
                            </small>
                        </Popup>
                    </Marker>
                );
            })}

            {/* 🎯 Marqueur du point central */}
            {midpoint && midpoint.lat && midpoint.lng && (
                <Marker position={[midpoint.lat, midpoint.lng]} icon={midpointIcon}>
                    <Popup>
                        <strong>🎯 Meeting Point</strong>
                        <br />
                        <small>
                            {midpoint.lat.toFixed(4)}, {midpoint.lng.toFixed(4)}
                        </small>
                    </Popup>
                </Marker>
            )}

            {/* 📍 Lignes vers le point central */}
            {midpoint &&
                midpoint.lat &&
                midpoint.lng &&
                participants.map((p) => {
                    if (!p.lat || !p.lng) return null;
                    return (
                        <Polyline
                            key={p.id + "-line"}
                            positions={[
                                [p.lat, p.lng],
                                [midpoint.lat, midpoint.lng],
                            ]}
                            color="#3388ff"
                            weight={2}
                            opacity={0.6}
                            dashArray="5, 10"
                        />
                    );
                })}

            {/* ⏳ Marqueur temporaire pour la sélection */}
            {selectedLocation && selectedLocation.lat && selectedLocation.lng && (
                <Marker
                    position={[selectedLocation.lat, selectedLocation.lng]}
                    icon={tempIcon}
                >
                    <Popup>
                        <strong>Selected Location</strong>
                        <br />
                        Click "Add Participant" to confirm
                    </Popup>
                </Marker>
            )}
        </MapContainer>
    );
}

export default MapView;