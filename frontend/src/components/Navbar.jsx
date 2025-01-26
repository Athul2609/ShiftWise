// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Assuming you're using react-router for navigation

const Navbar = ({ doctorRole }) => {
  return (
    <nav className="bg-[#7FA1C3] p-4 flex justify-between items-center">
      {/* Left side: Product name */}
      <Link to="/">
        <div className="text-2xl font-bold" style={{ color: '#E2DAD6' }}>ShiftWise</div>
      </Link>
      {/* Right side: Profile button and navigation links */}
      <div className="flex items-center space-x-6">
        {/* User Profile Button */}

        {/* Links */}
        <div className="flex space-x-4">
          {doctorRole === 2 ? (
            <Link
              to="/admin"
              className="hover:underline font-outfit"
              style={{ color: '#E2DAD6' }}
            >
              Admin
            </Link>
          ) : (
            <Link
              to="/request"
              className="font-outfit hover:underline"
              style={{ color: '#E2DAD6' }}
            >
              Request Leave
            </Link>
          )}

          {doctorRole === 1 && (
            <Link
              to="/manage-team"
              className="font-outfit hover:underline"
              style={{ color: '#E2DAD6' }}
            >
              Manage Team
            </Link>
          )}
        </div>
        {/* <button className="w-10 h-10 rounded-full bg-gray-600 flex justify-center items-center text-white"> */}
          {/* <span className="text-xl">👤</span> You can replace this with an avatar */}
        <button
              className="hover:text-blue-400 font-outfit hover:underline"
              style={{ color: '#E2DAD6' }}
            >
          Sign Out
        </button>

      </div>
    </nav>
  );
};

export default Navbar;
