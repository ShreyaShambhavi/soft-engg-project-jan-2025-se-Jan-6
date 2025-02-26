// eslint-disable-next-line no-unused-vars
import React from 'react';
import { useAuth } from '../context/AuthContext';

const LogoutButton = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <button onClick={handleLogout} className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700">
      Logout
    </button>
  );
};

export default LogoutButton;