import { forwardRef, useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './Input.css';

const defaultCenter = [42.3601, -71.0589];

const pickIcon = L.divIcon({
    className: '',
    html: '<div class="address-pick-marker"><span></span></div>',
    iconSize: [32, 34],
    iconAnchor: [16, 30]
});

function PickerMap({ point, onPick }) {
    useMapEvents({
        click: (e) => {
            onPick({
                lat: Number(e.latlng.lat.toFixed(6)),
                lon: Number(e.latlng.lng.toFixed(6))
            });
        }
    });

    return point ? (
        <Marker position={[point.lat, point.lon]} icon={pickIcon} />
    ) : null;
}

function PickerResize() {
    const map = useMap();

    useEffect(() => {
        const timer = setTimeout(() => map.invalidateSize(), 100);
        return () => clearTimeout(timer);
    }, [map]);

    return null;
}

async function browserSearch(text) {
    const queries = [
        text,
        `${text}, Boston, MA`,
        `${text}, Massachusetts`,
        `${text}, United States`
    ];
    const searches = queries.map(async (query) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 3500);
        try {
            const params = new URLSearchParams({
                q: query,
                format: 'jsonv2',
                addressdetails: '1',
                limit: '5',
                countrycodes: 'us'
            });
            const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
                signal: controller.signal
            });
            if (!response.ok) return [];

            const rows = await response.json();
            return rows.map((place) => ({
                label: place.display_name,
                lat: Number(place.lat),
                lon: Number(place.lon),
                source: 'nominatim'
            }));
        } catch {
            return [];
        } finally {
            clearTimeout(timer);
        }
    });

    const results = await Promise.all(searches);
    return results.flat();
}

function mergeSuggestions(items) {
    const seen = new Set();
    const merged = [];

    items.forEach((item) => {
        if (!item.label || seen.has(item.label)) return;
        seen.add(item.label);
        merged.push(item);
    });

    return merged.slice(0, 8);
}

const AddressInput = forwardRef(function AddressInput({
                                                          label,
                                                          placeholder,
                                                          value,
                                                          onChange,
                                                          onSelectSuggestion,
                                                          required = false,
                                                          helperText,
                                                          errorText,
                                                          className = '',
                                                          name
                                                      }, ref) {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const [pickedPoint, setPickedPoint] = useState(null);

    useEffect(() => {
        const text = value?.trim();
        if (!text || text.length < 3) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/geocode?q=${encodeURIComponent(text)}`);
                const data = await response.json();
                const backendSuggestions = response.ok ? (data.suggestions || []) : [];
                const browserSuggestions = await browserSearch(text);
                setSuggestions(mergeSuggestions([...backendSuggestions, ...browserSuggestions]));
            } catch {
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [value]);

    const handlePick = (suggestion) => {
        onSelectSuggestion?.(suggestion);
        setFocused(false);
    };

    const confirmMapPick = () => {
        if (!pickedPoint) return;

        const labelText = value?.trim() || `Pinned location ${pickedPoint.lat}, ${pickedPoint.lon}`;
        onSelectSuggestion?.({
            label: labelText,
            lat: pickedPoint.lat,
            lon: pickedPoint.lon
        });
        setShowPicker(false);
    };

    return (
        <div ref={ref} className={`input-group address-input ${className}`}>
            {label && (
                <label className="input-label">
                    {label} {required && <span className="required-indicator">*</span>}
                </label>
            )}

            <div className="address-input-wrap">
                <input
                    type="text"
                    className={`input-field ${errorText ? 'error' : ''}`}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setTimeout(() => setFocused(false), 150)}
                    required={required}
                    name={name}
                    autoComplete="off"
                />

                {focused && value?.trim()?.length >= 3 && (
                    <div className="address-suggestions">
                        {loading && (
                            <div className="address-suggestion muted">Searching addresses...</div>
                        )}

                        {!loading && suggestions.map((item) => (
                            <button
                                type="button"
                                key={`${item.label}-${item.lat}-${item.lon}`}
                                className="address-suggestion"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handlePick(item)}
                            >
                                <span>{item.label}</span>
                                {item.source === 'nominatim' && (
                                    <small>OpenStreetMap</small>
                                )}
                            </button>
                        ))}

                        {!loading && suggestions.length === 0 && (
                            <div className="address-suggestion muted">No exact match found</div>
                        )}
                    </div>
                )}
            </div>

            <button
                type="button"
                className="address-map-button"
                onClick={() => {
                    setPickedPoint(null);
                    setShowPicker(true);
                }}
            >
                Pick on map
            </button>

            {(errorText || helperText) && (
                <p className={`input-helper-text ${errorText ? 'error' : ''}`}>
                    {errorText || helperText}
                </p>
            )}

            {showPicker && (
                <div className="address-picker-overlay">
                    <div className="address-picker-panel">
                        <div className="address-picker-header">
                            <h3>Pick a location</h3>
                            <button type="button" onClick={() => setShowPicker(false)}>Close</button>
                        </div>

                        <div className="address-picker-map">
                            <MapContainer
                                center={pickedPoint ? [pickedPoint.lat, pickedPoint.lon] : defaultCenter}
                                zoom={13}
                                scrollWheelZoom={true}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <PickerResize />
                                <TileLayer
                                    attribution="&copy; OpenStreetMap contributors"
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <PickerMap point={pickedPoint} onPick={setPickedPoint} />
                            </MapContainer>
                        </div>

                        <div className="address-picker-actions">
                            <span>
                                {pickedPoint
                                    ? `${pickedPoint.lat}, ${pickedPoint.lon}`
                                    : 'Click the map to place a marker'}
                            </span>
                            <button
                                type="button"
                                className="address-confirm-button"
                                onClick={confirmMapPick}
                                disabled={!pickedPoint}
                            >
                                Use this location
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default AddressInput;
