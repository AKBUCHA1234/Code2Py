import { Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import Navbar from './components/Navbar'
import { CommandPalette } from './components/CommandPalette'
import Landing from './pages/Landing'
import Analyze from './pages/Analyze'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Notes from './pages/Notes'
import LearningPath from './pages/LearningPath'

// The app shell: a persistent navbar, then whichever page matches the URL.
function App() {
  return (
    <>
      <Navbar />
      <CommandPalette />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/analyze" element={<Analyze />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/learning-path" element={<LearningPath />} />
      </Routes>
      <Analytics />
    </>
  )
}

export default App
