// src/pages/JoinMeetup.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Input from '../components/ui/Input';
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
    const [preferencesLocked, setPreferencesLocked] = useState(false);

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

    // Load meetup data from localStorage
    const loadMeetupData = (code) => {
        const data = localStorage.getItem(`meetup_${code.toUpperCase()}`);
        if (data) {
            const meetup = JSON.parse(data);
            setMeetupData(meetup);
            setError('');

            // Check if preferences are locked by organizer
            if (meetup.budget || meetup.indoorOutdoor !== 'Any') {
                setPreferencesLocked(true);
            }
        } else {
            setMeetupData(null);
            setError('Event code not found');
        }
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // If event code is being edited, validate it
        if (name === 'eventCode' && value.length >= 6) {
            loadMeetupData(value);
        }
    };

    // Handle indoor/outdoor selection
    const handleIndoorOutdoorSelect = (value) => {
        setFormData(prev => ({
            ...prev,
            indoorOutdoor: value
        }));
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate event code
        if (!meetupData) {
            setError('Please enter a valid event code');
            return;
        }

        // Validate location
        if (!formData.location.trim()) {
            setError('Please enter your location');
            return;
        }

        // Create participant data
        const participant = {
            id: Math.random().toString(36).substring(2, 9),
            name: formData.name || 'Anonymous',
            location: formData.location,
            budgetPreference: formData.budgetPreference,
            indoorOutdoor: formData.indoorOutdoor,
            joinedAt: new Date().toISOString()
        };

        // Add participant to meetup
        const updatedMeetup = {
            ...meetupData,
            participants: [...(meetupData.participants || []), participant]
        };

        // Save updated meetup data
        localStorage.setItem(`meetup_${formData.eventCode.toUpperCase()}`, JSON.stringify(updatedMeetup));

        // Navigate to results page (or waiting page if not enough participants)
        if (updatedMeetup.participants.length >= 2) {
            navigate(`/results/${formData.eventCode.toUpperCase()}`);
        } else {
            // For now, go to results anyway (demo purposes)
            navigate(`/results/${formData.eventCode.toUpperCase()}`);
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
                    <form onSubmit={handleSubmit} className="join-meetup-form">
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
                            <Input
                                label="Your Location"
                                type="text"
                                name="location"
                                placeholder="e.g., 123 Main St, City, State or ZIP code"
                                value={formData.location}
                                onChange={handleInputChange}
                                required
                                helperText="Required to calculate fair meeting spots"
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