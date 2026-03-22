import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import FacultyDashboard from './pages/FacultyDashboard'
import StudentDashboard from './pages/StudentDashboard'
import ChatWidget from './components/ChatWidget'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login/:mode" element={<Login />} />
        <Route path="/login" element={<Navigate to="/login/student" replace />} />
        <Route path="/signup/:mode" element={<SignUp />} />
        <Route path="/signup" element={<Navigate to="/signup/student" replace />} />
        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
        <Route path="/admin/dashboard" element={<Navigate to="/faculty/dashboard" replace />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {/* AI Chat Widget - Available on all pages */}
      <ChatWidget />
    </Router>
  )
}

export default App
