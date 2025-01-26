import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import RequestPage from './pages/requestPage';
import ManageTeam from './pages/ManageTeam';
import Admin from './pages/Admin';

function App() {

  return (
    <Router>
      {/* Navbar Component */}
      <Navbar doctorRole={0} />

      {/* Define Routes */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/request" element={<RequestPage />} />
        <Route path="/manage-team" element={<ManageTeam />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  )
}

export default App
