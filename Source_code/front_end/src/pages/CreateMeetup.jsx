// src/pages/CreateMeetup.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import ToggleButton from '../components/ui/ToggleButton';
import Button from '../components/ui/Button';
import './CreateMeetup.css';

function CreateMeetup() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        meetupName: '',
        activityType: '',
        budget: '',
        indoorOutdoor: 'Any'
    });

    const activityOptions = [
        { value: 'coffee', label: 'Coffee' },
        { value: 'food', label: 'Food' },
        { value: 'study', label: 'Study' },
        { value: 'drinks', label: 'Drinks' },
        { value: 'entertainment', label: 'Entertainment' }
    ];

    const budgetOptions = [
        { value: '$', label: '$ - Budget friendly' },
        { value: '$$', label: '$$ - Moderate' },
        { value: '$$$', label: '$$$ - Premium' }
    ];

    const indoorOutdoorOptions = ['Indoor', 'Outdoor', 'Any'];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleIndoorOutdoorSelect = (value) => {
        setFormData(prev => ({
            ...prev,
            indoorOutdoor: value
        }));
    };

    // const handleSubmit = (e) => {
    //     e.preventDefault();

    //     const eventCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    //     const meetupData = {
    //         ...formData,
    //         eventCode,
    //         createdAt: new Date().toISOString(),
    //         participants: []
    //     };

    //     localStorage.setItem(`meetup_${eventCode}`, JSON.stringify(meetupData));

    //     navigate(`/event-created/${eventCode}`);
    // };
    const handleSubmit = async (e) => {
        e.preventDefault();

        const eventCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        const meetupData = {
            ...formData,
            eventCode,
            createdAt: new Date().toISOString(),
            participants: []
        };

        try {
            const response = await fetch('/api/create-meetup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(meetupData)
            });

            if (!response.ok) {
                throw new Error('Failed to create meetup');
            }

            const result = await response.json();

            // optional: keep localStorage too, if teammate flow still uses it
            localStorage.setItem(`meetup_${eventCode}`, JSON.stringify(meetupData));

            navigate(`/event-created/${result.eventCode}`);
        } catch (error) {
            console.error('Error sending meetup data:', error);
            alert('Could not create meetup');
        }
    };


    const handleCancel = () => {
        navigate('/');
    };

    return (
        <div className="create-meetup-page">
            <Header />

            <main className="create-meetup-main">
                <div className="create-meetup-container">
                    {/* Hero Gradient Header */}
                    <div className="page-hero">
                        <h1 className="page-hero-title">Plan Your Meetup</h1>
                        <p className="page-hero-subtitle">
                            Find the perfect spot that's fair for everyone
                        </p>
                    </div>

                    {/* Form Card */}
                    <form onSubmit={handleSubmit} className="create-meetup-form">

                        {/* Meetup Name */}
                        <div className="form-section">
                            <Input
                                label="Meetup Name"
                                type="text"
                                name="meetupName"
                                placeholder="Sunday Brunch"
                                value={formData.meetupName}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Preferred Area */}
                        <div className="form-section">
                            <Input
                                label="Preferred Area"
                                type="text"
                                name="preferredArea"
                                placeholder="Downtown, City Center, or pin description"
                                value={formData.preferredArea || ''}
                                onChange={handleInputChange}
                            />
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
                        </div>

                        {/* Action buttons */}
                        <div className="form-actions">
                            <Button type="submit" variant="primary" size="large" className="btn-cta">
                                Generate Plan
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default CreateMeetup;