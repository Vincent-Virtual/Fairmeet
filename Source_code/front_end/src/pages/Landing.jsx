// src/pages/Landing.jsx
import { useNavigate } from 'react-router-dom';
import {
    MapPinIcon,
    Cog6ToothIcon,
    UsersIcon
} from '@heroicons/react/24/outline';
import Header from '../components/Header';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import './Landing.css';

function Landing() {
    const navigate = useNavigate();

    const handleCreateMeetup = () => {
        navigate('/create');
    };

    const handleJoinMeetup = () => {
        navigate('/join');
    };

    return (
        <div className="landing-page">
            <Header />

            <main className="landing-main">
                {/* Hero Section with Illustration */}
                <section className="hero-section">
                    <div className="hero-content">
                        <div className="hero-text">
                            <h1 className="hero-title">Find the Fairest Meeting Spot</h1>
                            <p className="hero-subtitle">
                                Rule-based activity planning for group meetups. No accounts required.
                                Just share a code and let everyone join.
                            </p>
                        </div>

                        {/* ILLUSTRATION */}
                        <div className="hero-illustration">
                            <img
                                src="/illustrations/people-meeting.png"
                                alt="People having fun together"
                                className="illustration-img"
                            />
                        </div>
                    </div>
                </section>

                {/* Form Card */}
                <section className="form-section">
                    <div className="form-card">
                        <div className="form-header">
                            <h2 className="form-title">Get Started</h2>
                            <p className="form-description">
                                Create a new meetup or join an existing one
                            </p>
                        </div>

                        {/* CTA Buttons - Sans emojis */}
                        <div className="cta-buttons">
                            <Button
                                variant="primary"
                                size="large"
                                onClick={handleCreateMeetup}
                                className="btn-cta"
                            >
                                Create Meetup
                            </Button>
                            <Button
                                variant="secondary"
                                size="large"
                                onClick={handleJoinMeetup}
                            >
                                Join Meetup
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Features Section - Avec icônes */}
                <section className="features-section">
                    <h2 className="features-title">Why FairMeet?</h2>
                    <div className="features-grid">
                        <Card
                            icon={<MapPinIcon className="feature-icon-svg" />}
                            title="Fair Distance"
                            description="Finds venues that minimize travel time for all participants"
                        />
                        <Card
                            icon={<Cog6ToothIcon className="feature-icon-svg" />}
                            title="Rule-Based"
                            description="Set preferences like budget, indoor/outdoor, and activity type"
                        />
                        <Card
                            icon={<UsersIcon className="feature-icon-svg" />}
                            title="No Sign-Up"
                            description="Share a simple code. No authentication or payments needed"
                        />
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="landing-footer">
                <p>FairMeet © 2025</p>
            </footer>
        </div>
    );
}

export default Landing;