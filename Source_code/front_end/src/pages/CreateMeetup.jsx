// src/pages/CreateMeetup.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import ToggleButton from '../components/ui/ToggleButton';
import Button from '../components/ui/Button';
import './CreateMeetup.css';

/**
 * CreateMeetup Page Component (Function Component)
 * Form to create a new meetup event
 */
function CreateMeetup() {
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
        meetupName: '',
        activityType: '',
        budget: '',
        indoorOutdoor: 'Any'
    });

    // Activity type options
    const activityOptions = [
        { value: 'coffee', label: 'Coffee' },
        { value: 'food', label: 'Food' },
        { value: 'study', label: 'Study' },
        { value: 'drinks', label: 'Drinks' },
        { value: 'entertainment', label: 'Entertainment' }
    ];

    // Budget options
    const budgetOptions = [
        { value: '$', label: '$ - Budget friendly' },
        { value: '$$', label: '$$ - Moderate' },
        { value: '$$$', label: '$$$ - Premium' }
    ];

    // Indoor/Outdoor options
    const indoorOutdoorOptions = ['Indoor', 'Outdoor', 'Any'];

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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

        // Generate a random event code (6 characters)
        const eventCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Store meetup data in localStorage (temporary solution)
        const meetupData = {
            ...formData,
            eventCode,
            createdAt: new Date().toISOString(),
            participants: []
        };

        localStorage.setItem(`meetup_${eventCode}`, JSON.stringify(meetupData));

        // Navigate to event created page
        navigate(`/event-created/${eventCode}`);
    };

    // Handle cancel
    const handleCancel = () => {
        navigate('/');
    };

    return (
        <div className="create-meetup-page">
            <Header />

            <main className="create-meetup-main">
                <div className="create-meetup-container">
                    {/* Page header */}
                    <div className="page-header">
                        <h1 className="page-title">Create a Meetup</h1>
                        <p className="page-subtitle">
                            Set up your group meetup preferences and get a shareable code
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="create-meetup-form">
                        {/* Meetup Name */}
                        <div className="form-section">
                            <Input
                                label="Meetup Name"
                                type="text"
                                name="meetupName"
                                placeholder="e.g., Team Lunch, Study Group..."
                                value={formData.meetupName}
                                onChange={handleInputChange}
                                helperText="Optional"
                            />
                        </div>

                        {/* Activity Type */}
                        <div className="form-section">
                            <Select
                                label="Activity Type"
                                name="activityType"
                                value={formData.activityType}
                                onChange={handleInputChange}
                                options={activityOptions}
                                placeholder="Select activity type"
                                required
                            />
                            <p className="field-note">Required field</p>
                        </div>

                        {/* Budget */}
                        <div className="form-section">
                            <Select
                                label="Budget"
                                name="budget"
                                value={formData.budget}
                                onChange={handleInputChange}
                                options={budgetOptions}
                                placeholder="Select budget range"
                            />
                            <p className="field-note">Optional</p>
                        </div>

                        {/* Indoor/Outdoor */}
                        <div className="form-section">
                            <ToggleButton
                                label="Indoor / Outdoor"
                                options={indoorOutdoorOptions}
                                selected={formData.indoorOutdoor}
                                onSelect={handleIndoorOutdoorSelect}
                            />
                            <p className="field-note">Optional</p>
                        </div>

                        {/* Candidate Source Info */}
                        <div className="info-section">
                            <p className="info-text">
                                <strong>Candidate Source:</strong> Default venues from local database
                            </p>
                        </div>

                        {/* Action buttons */}
                        <div className="form-actions">
                            <Button type="submit" variant="primary" size="large">
                                Create Meetup
                            </Button>
                            <Button type="button" variant="secondary" size="large" onClick={handleCancel}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default CreateMeetup;