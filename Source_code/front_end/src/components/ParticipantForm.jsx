import { useState } from "react";

function ParticipantForm({ onAdd, selectedLocation }) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [activity, setActivity] = useState("Restaurant");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!firstName.trim() || !lastName.trim()) {
            alert("Please fill all fields.");
            return;
        }

        if (!selectedLocation) {
            alert("Please click on the map to select a location first.");
            return;
        }

        onAdd({ firstName: firstName.trim(), lastName: lastName.trim(), activity });

        // Reset form
        setFirstName("");
        setLastName("");
        setActivity("Restaurant");
    };

    const formStyle = {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    };

    const inputGroupStyle = {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
    };

    const labelStyle = {
        fontSize: "14px",
        fontWeight: "500",
        color: "#333",
    };

    const inputStyle = {
        padding: "8px 10px",
        fontSize: "14px",
        border: "1px solid #ddd",
        borderRadius: "4px",
        outline: "none",
    };

    const buttonStyle = {
        padding: "10px",
        fontSize: "14px",
        fontWeight: "500",
        backgroundColor: selectedLocation ? "#28a745" : "#6c757d",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: selectedLocation ? "pointer" : "not-allowed",
        marginTop: "8px",
    };

    const locationInfoStyle = {
        padding: "8px",
        backgroundColor: selectedLocation ? "#d4edda" : "#f8f9fa",
        border: `1px solid ${selectedLocation ? "#c3e6cb" : "#dee2e6"}`,
        borderRadius: "4px",
        fontSize: "13px",
        color: selectedLocation ? "#155724" : "#6c757d",
    };

    return (
        <form onSubmit={handleSubmit} style={formStyle}>
            <div style={inputGroupStyle}>
                <label style={labelStyle}>First Name *</label>
                <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    style={inputStyle}
                    placeholder="Enter first name"
                    required
                />
            </div>

            <div style={inputGroupStyle}>
                <label style={labelStyle}>Last Name *</label>
                <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    style={inputStyle}
                    placeholder="Enter last name"
                    required
                />
            </div>

            <div style={inputGroupStyle}>
                <label style={labelStyle}>Activity</label>
                <select
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    style={inputStyle}
                >
                    <option value="Restaurant">🍽️ Restaurant</option>
                    <option value="Bowling">🎳 Bowling</option>
                    <option value="Cinema">🎬 Cinema</option>
                    <option value="Park">🌳 Park</option>
                    <option value="Coffee">☕ Coffee</option>
                    <option value="Bar">🍺 Bar</option>
                </select>
            </div>

            <div style={locationInfoStyle}>
                <strong>📍 Location:</strong>
                <br />
                {selectedLocation ? (
                    <span>
                        ✅ {selectedLocation.lat.toFixed(4)},{" "}
                        {selectedLocation.lng.toFixed(4)}
                    </span>
                ) : (
                    <span>⚠️ Click on the map to select</span>
                )}
            </div>

            <button type="submit" style={buttonStyle} disabled={!selectedLocation}>
                {selectedLocation ? "✅ Add Participant" : "⚠️ Select Location First"}
            </button>
        </form>
    );
}

export default ParticipantForm;