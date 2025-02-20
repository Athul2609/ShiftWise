import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from "../App";

const Navbar = () => {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const doctorRole = user?.role ?? 0;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-[#7FA1C3] p-4 flex justify-between items-center relative">
      <Link to="/">
        <div className="text-2xl font-bold text-[#E2DAD6]">ShiftWise</div>
      </Link>

      {/* Mobile Menu Toggle Button */}
      <button onClick={toggleMenu} className="text-[#E2DAD6] text-3xl md:hidden">
        {isMenuOpen ? '✕' : '☰'}
      </button>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-6">
        {isAuthenticated && (
          <>
            {doctorRole === 2 ? (
              <Link to="/admin" className="text-[#E2DAD6] font-outfit hover:underline">Admin</Link>
            ) : (
              <Link to="/request" className="text-[#E2DAD6] font-outfit hover:underline">Request Leave</Link>
            )}

            {doctorRole === 1 && (
              <Link to="/manage-team" className="text-[#E2DAD6] font-outfit hover:underline">Manage Team</Link>
            )}

            <button onClick={handleLogout} className="text-[#E2DAD6] font-outfit hover:underline">
              Sign Out
            </button>
          </>
        )}
        {!isAuthenticated && (
          <Link to="/login" className="text-[#E2DAD6] font-outfit hover:underline">Sign In</Link>
        )}
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-[#7FA1C3] flex flex-col items-center py-4 space-y-4 md:hidden">
          {isAuthenticated ? (
            <>
              {doctorRole === 2 ? (
                <Link to="/admin" className="text-[#E2DAD6] font-outfit hover:underline" onClick={toggleMenu}>Admin</Link>
              ) : (
                <Link to="/request" className="text-[#E2DAD6] font-outfit hover:underline" onClick={toggleMenu}>Request Leave</Link>
              )}

              {doctorRole === 1 && (
                <Link to="/manage-team" className="text-[#E2DAD6] font-outfit hover:underline" onClick={toggleMenu}>Manage Team</Link>
              )}

              <button onClick={() => { handleLogout(); toggleMenu(); }} className="text-[#E2DAD6] font-outfit hover:underline">
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/login" className="text-[#E2DAD6] font-outfit hover:underline" onClick={toggleMenu}>Sign In</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
