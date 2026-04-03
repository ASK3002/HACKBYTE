// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { Dashboard } from './pages/Dashboard'
import { CandidateProfile } from './pages/CandidateProfile'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/candidate/:id" element={<CandidateProfile />} />
      </Routes>
    </Router>
  )
}

export default App
