// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import CreateMeetup from './pages/CreateMeetup';
import EventCreated from './pages/EventCreated';
import JoinMeetup from './pages/JoinMeetup';


function App() {
    return (
        <Router>
            <div className="app">
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/create" element={<CreateMeetup />} />
                    <Route path="/event-created/:eventCode" element={<EventCreated />} />

                    {/* Join meetup routes */}
                    <Route path="/join" element={<JoinMeetup />} />
                    <Route path="/join/:eventCode" element={<JoinMeetup />} />

                    {/* Temporary placeholder */}
                    <Route path="/results/:eventCode" element={<div style={{padding: '2rem'}}>Results - Coming Soon</div>} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;