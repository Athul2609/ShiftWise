import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import Cookies from 'js-cookie';

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
  const [user, setUser] = useState({ role: 0 });

  const login = (token) => {
    const decodedToken = jwtDecode(token);
    setIsAuthenticated(true);
    setUser({ doctorId: decodedToken.doctor_id, role: decodedToken.role });
  };

  const logout = () => {
    Cookies.remove('jwt');
    setIsAuthenticated(false);
    setUser({ role: 0 });
  };

  useEffect(() => {
    const token = Cookies.get('jwt'); // Retrieve token from cookies
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp > currentTime) {
          login(token);
        } else {
          logout();
        }
      } catch (error) {
        console.error('Invalid token:', error);
        logout();
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// Protected Route Component(for some reason the AuthContext was always giving default values so had to do it like this)
const ProtectedRoute = ({ element, requiredRole }) => {
  const token = Cookies.get('jwt');
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp > currentTime) {
        if (requiredRole !== undefined && decodedToken.role !== requiredRole) {
          return <Navigate to="/" replace />;
        }
      } else {
        return <Navigate to="/login" replace />;
      }
    } catch (error) {
      console.error('Invalid token:', error);
    }
  }
  else{
    return <Navigate to="/login" replace />;
  }

  return element;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute element={<HomePage />} />} />
          <Route path="/request" element={<ProtectedRoute element={<RequestPage />} />} />
          <Route path="/manage-team" element={<ProtectedRoute element={<ManageTeam />} requiredRole={1} />} />
          <Route path="/admin" element={<ProtectedRoute element={<Admin />} requiredRole={2} />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
