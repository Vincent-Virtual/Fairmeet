// src/pages/Landing.jsx
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import './Landing.css';

/**
 * Landing Page Component (Function Component)
 * Main entry point for the FairMeet application
 */
function Landing() {
    const navigate = useNavigate();

    // Handle navigation to create meetup page
    const handleCreateMeetup = () => {
        navigate('/create');
    };

    // Handle navigation to join meetup page
    const handleJoinMeetup = () => {
        navigate('/join');
    };

    return (
        <div className="landing-page">
            <Header />

            {/* Hero Section */}
            <main className="landing-main">
                <section className="hero-section">
                    <h1 className="hero-title">Find the Fairest Meeting Spot</h1>
                    <p className="hero-subtitle">
                        Rule-based activity planning for group meetups. No accounts
                        required. Just share a code and let everyone join.
                    </p>

                    {/* CTA Buttons */}
                    <div className="cta-buttons">
                        <Button
                            variant="primary"
                            size="large"
                            onClick={handleCreateMeetup}
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
                </section>

                {/* Features Section */}
                <section className="features-section">
                    <div className="features-grid">
                        <Card
                            title="Fair Distance"
                            description="Finds venues that minimize travel time for all participants"
                        />
                        <Card
                            title="Rule-Based"
                            description="Set preferences like budget, indoor/outdoor, and activity type"
                        />
                        <Card
                            title="No Sign-Up"
                            description="Share a simple code. No authentication or payments needed"
                        />
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="landing-footer">
                <p>FairMeet</p>
            </footer>
        </div>
    );
}

export default Landing;