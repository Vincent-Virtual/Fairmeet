// src/pages/JoinMeetup.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Input from '../components/ui/Input';
import AddressInput from '../components/ui/AddressInput';
import Select from '../components/ui/Select';
import ToggleButton from '../components/ui/ToggleButton';
import Button from '../components/ui/Button';
import './JoinMeetup.css';

/**
 * JoinMeetup Page Component (Function Component)
 * Allows participants to join a meetup using an event code
 */
function JoinMeetup() {
    const { eventCode: urlEventCode } = useParams();
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
        eventCode: urlEventCode || '',
        name: '',
        location: '',
        budgetPreference: '',
        indoorOutdoor: 'Any'
    });

    const [meetupData, setMeetupData] = useState(null);
    const [error, setError] = useState('');
    const [locationError, setLocationError] = useState('');
    const [preferencesLocked, setPreferencesLocked] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const locationRef = useRef(null);

    // Budget options
    const budgetOptions = [
        { value: '$', label: '$ - Budget friendly' },
        { value: '$$', label: '$$ - Moderate' },
        { value: '$$$', label: '$$$ - Premium' }
    ];

    // Indoor/Outdoor options
    const indoorOutdoorOptions = ['Indoor', 'Outdoor', 'Any'];

    // Load meetup data when event code changes
    useEffect(() => {
        if (formData.eventCode) {
            loadMeetupData(formData.eventCode);
        }
    }, [formData.eventCode]);

    // // Load meetup data from localStorage
    // const loadMeetupData = (code) => {
    //     const data = localStorage.getItem(`meetup_${code.toUpperCase()}`);
    //     if (data) {
    //         const meetup = JSON.parse(data);
    //         setMeetupData(meetup);
    //         setError('');

    //         // Check if preferences are locked by organizer
    //         if (meetup.budget || meetup.indoorOutdoor !== 'Any') {
    //             setPreferencesLocked(true);
    //         }
    //     } else {
    //         setMeetupData(null);
    //         setError('Event code not found');
    //     }
    // };
    const loadMeetupData = async (code) => {
        try {
            const response = await fetch(`/api/meetup/${code.toUpperCase()}`);
            const meetup = await response.json();

            if (!response.ok) {
                throw new Error(meetup.error || 'Event code not found');
            }

            setMeetupData(meetup);
            setError('');

            if (meetup.budget || meetup.indoorOutdoor !== 'Any') {
                setPreferencesLocked(true);
            } else {
                setPreferencesLocked(false);
            }
        } catch (err) {
            setMeetupData(null);
            setError(err.message || 'Event code not found');
            setPreferencesLocked(false);
        }
    };



    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'location' ? {
                lat: null,
                lon: null,
                locationName: ''
            } : {})
        }));

        // If event code is being edited, validate it
        if (name === 'eventCode' && value.length >= 6) {
            loadMeetupData(value);
        }

        if (name === 'location') {
            setLocationError('');
        }
    };

    const scrollToLocation = () => {
        setTimeout(() => {
            locationRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 0);
    };

    const handleLocationSelect = (suggestion) => {
        setFormData(prev => ({
            ...prev,
            location: suggestion.label,
            locationName: suggestion.label,
            lat: suggestion.lat,
            lon: suggestion.lon
        }));
        setError('');
        setLocationError('');
    };

    // Handle indoor/outdoor selection
    const handleIndoorOutdoorSelect = (value) => {
        setFormData(prev => ({
            ...prev,
            indoorOutdoor: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!meetupData) {
            setError('Please enter a valid event code');
            return;
        }

        if (!formData.location.trim()) {
            setLocationError('Please enter your location');
            scrollToLocation();
            return;
        }

        if (formData.lat == null || formData.lon == null) {
            setLocationError('Please choose an address suggestion or pick your location on the map');
            scrollToLocation();
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await fetch('/api/join-meetup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    eventCode: formData.eventCode.toUpperCase(),
                    name: formData.name || 'Anonymous',
                    location: formData.location,
                    locationName: formData.locationName,
                    lat: formData.lat,
                    lon: formData.lon,
                    budgetPreference: formData.budgetPreference,
                    indoorOutdoor: formData.indoorOutdoor
                })
            });

            const updatedMeetup = await response.json();

            if (!response.ok) {
                throw new Error(updatedMeetup.error || 'Failed to join meetup');
            }

            const joinedParticipant = updatedMeetup.participants?.[updatedMeetup.participants.length - 1];
            if (joinedParticipant?.id) {
                sessionStorage.setItem(`fairmeet_participant_${formData.eventCode.toUpperCase()}`, joinedParticipant.id);
            }
            sessionStorage.setItem(`fairmeet_owner_location_${formData.eventCode.toUpperCase()}`, JSON.stringify({
                label: formData.locationName || formData.location,
                lat: formData.lat,
                lon: formData.lon
            }));

            navigate(`/results/${formData.eventCode.toUpperCase()}`);
        } catch (err) {
            setError(err.message || 'Failed to join meetup');
        } finally {
            setIsSubmitting(false);
        }
    };



    // Handle cancel
    const handleCancel = () => {
        navigate('/');
    };

    return (
        <div className="join-meetup-page">
            <Header />

            <main className="join-meetup-main">
                <div className="join-meetup-container">
                    {/* Page header */}
                    <div className="page-header">
                        <h1 className="page-title">Join a Meetup</h1>
                        <p className="page-subtitle">
                            Enter the event code and your location to join
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="join-meetup-form" noValidate>
                        {/* Event Code Section */}
                        <div className="form-section highlighted">
                            <Input
                                label="Event Code"
                                type="text"
                                name="eventCode"
                                placeholder="e.g., MTG-ABC123"
                                value={formData.eventCode}
                                onChange={handleInputChange}
                                required
                                helperText="Get this code from the meetup organizer"
                            />

                            {/* Error message */}
                            {error && formData.eventCode && (
                                <div className="error-message">{error}</div>
                            )}

                            {/* Success message */}
                            {meetupData && (
                                <div className="success-message">
                                    ✓ Found meetup: {meetupData.meetupName || 'Unnamed meetup'} ({meetupData.activityType})
                                </div>
                            )}
                        </div>

                        {/* Your Name */}
                        <div className="form-section">
                            <Input
                                label="Your Name"
                                type="text"
                                name="name"
                                placeholder="e.g., Alex"
                                value={formData.name}
                                onChange={handleInputChange}
                                helperText="Helps others identify you in the results"
                            />
                        </div>

                        {/* Your Location */}
                        <div className="form-section highlighted">
                            <AddressInput
                                ref={locationRef}
                                label="Your Location"
                                name="location"
                                placeholder="e.g., 123 Main St, City, State or ZIP code"
                                value={formData.location}
                                onChange={handleInputChange}
                                onSelectSuggestion={handleLocationSelect}
                                required
                                errorText={locationError}
                                helperText="Pick a suggested address when possible"
                            />
                        </div>

                        {/* Preferences Section */}
                        <div className="preferences-section">
                            <div className="preferences-header">
                                <h3>Preferences:</h3>
                                {preferencesLocked ? (
                                    <span className="locked-badge">
                    The event organizer has not locked preferences. You can set your own below.
                  </span>
                                ) : (
                                    <span className="unlocked-badge">
                    The event organizer has not locked preferences. You can set your own below.
                  </span>
                                )}
                            </div>

                            {/* Budget Preference */}
                            <div className="form-section">
                                <Select
                                    label="Budget Preference"
                                    name="budgetPreference"
                                    value={formData.budgetPreference}
                                    onChange={handleInputChange}
                                    options={budgetOptions}
                                    placeholder="Select budget range"
                                />
                            </div>

                            {/* Indoor/Outdoor */}
                            <div className="form-section">
                                <ToggleButton
                                    label="Indoor / Outdoor"
                                    options={indoorOutdoorOptions}
                                    selected={formData.indoorOutdoor}
                                    onSelect={handleIndoorOutdoorSelect}
                                />
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="form-actions">
                            <Button
                                type="submit"
                                variant="primary"
                                size="large"
                                disabled={!meetupData}
                                loading={isSubmitting}
                            >
                                Join Meetup
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                size="large"
                                onClick={handleCancel}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default JoinMeetup;
