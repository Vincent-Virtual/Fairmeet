import { useState, useMemo } from "react";
import ParticipantForm from "./components/ParticipantForm";
import MapView from "./components/MapView";
import "leaflet/dist/leaflet.css"; // ⚠️ CRITIQUE : Import du CSS Leaflet

function App() {
    const [participants, setParticipants] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);

    // ➜ Calcul automatique du midpoint
    const midpoint = useMemo(() => {
        if (participants.length === 0) return null;

        const avgLat =
            participants.reduce((sum, p) => sum + p.lat, 0) / participants.length;
        const avgLng =
            participants.reduce((sum, p) => sum + p.lng, 0) / participants.length;

        return { lat: avgLat, lng: avgLng };
    }, [participants]);

    // ➜ Ajouter un participant
    const addParticipant = (data) => {
        if (!selectedLocation) {
            alert("Please click on the map to select a location.");
            return;
        }

        const newParticipant = {
            id: crypto.randomUUID(),
            firstName: data.firstName,
            lastName: data.lastName,
            activity: data.activity, // ✅ Ajout de l'activité
            lat: selectedLocation.lat,
            lng: selectedLocation.lng,
        };

        setParticipants((prev) => [...prev, newParticipant]);
        setSelectedLocation(null);
    };

    const removeParticipant = (id) => {
        setParticipants((prev) => prev.filter((p) => p.id !== id));
    };

    const resetAll = () => {
        setParticipants([]);
        setSelectedLocation(null);
    };

    return (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
            <div
                style={{
                    width: "320px",
                    padding: "15px",
                    background: "#f9f9f9",
                    overflowY: "auto",
                }}
            >
                <h2 style={{ margin: "0 0 20px 0" }}>📍 FairMeet</h2>

                <ParticipantForm
                    onAdd={addParticipant}
                    selectedLocation={selectedLocation}
                />

                <hr style={{ margin: "20px 0" }} />

                <div style={{ marginBottom: "15px" }}>
                    <strong>Participants: {participants.length}</strong>
                    {participants.length > 0 && (
                        <ul style={{ marginTop: "10px", paddingLeft: "20px" }}>
                            {participants.map((p) => (
                                <li key={p.id} style={{ marginBottom: "8px" }}>
                                    {p.firstName} {p.lastName} - {p.activity}
                                    <button
                                        onClick={() => removeParticipant(p.id)}
                                        style={{
                                            marginLeft: "10px",
                                            padding: "2px 8px",
                                            fontSize: "12px",
                                        }}
                                    >
                                        ✕
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {midpoint && (
                    <div style={{ marginBottom: "15px" }}>
                        <strong>🎯 Midpoint:</strong>
                        <br />
                        <small>
                            Lat: {midpoint.lat.toFixed(4)}, Lng: {midpoint.lng.toFixed(4)}
                        </small>
                    </div>
                )}

                <button
                    onClick={resetAll}
                    style={{
                        width: "100%",
                        padding: "10px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    Reset All
                </button>
            </div>

            <MapView
                participants={participants}
                midpoint={midpoint}
                onLocationSelect={setSelectedLocation}
                selectedLocation={selectedLocation}
            />
        </div>
    );
}

export default App;