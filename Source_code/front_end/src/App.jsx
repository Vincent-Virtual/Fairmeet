// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import CreateMeetup from './pages/CreateMeetup';
import EventCreated from './pages/EventCreated';
import JoinMeetup from './pages/JoinMeetup';
import Results from './pages/Results';


function App() {
    return (
        <Router>
            <div className="app">
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/create" element={<CreateMeetup />} />
                    <Route path="/event-created/:eventCode" element={<EventCreated />} />
                    <Route path="/join" element={<JoinMeetup />} />
                    <Route path="/join/:eventCode" element={<JoinMeetup />} />
                    <Route path="/results/:eventCode" element={<Results />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;