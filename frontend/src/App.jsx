import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import RequestPage from './pages/requestPage';
import ManageTeam from './pages/ManageTeam';
import Admin from './pages/Admin';
import LoginPage from './pages/LoginPage';

// Create Authentication Context
export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// Protected Route Component
const ProtectedRoute = ({ element, ...rest }) => {
  const { isAuthenticated } = useAuth(); // we can just call the proposed api here

  return isAuthenticated ? (
    element
  ) : (
    <Navigate to="/login" replace />
    // element
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar doctorRole={2} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute element={<HomePage />} />} />
          <Route path="/request" element={<ProtectedRoute element={<RequestPage />} />} />
          <Route path="/manage-team" element={<ProtectedRoute element={<ManageTeam />} />} />
          <Route path="/admin" element={<ProtectedRoute element={<Admin />} />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
