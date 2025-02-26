// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ element: Component, ...rest }) => {
  const { user, loading } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        setRedirect(true);
      }, 1500); // Show the modal for 1.5 seconds
    }
  }, [loading, user]);

  if (loading) {
    return <div>Loading...</div>; // You can replace this with a loading spinner or any other loading indicator
  }

  if (redirect) {
    return <Navigate to="/login" />;
  }

  if (!user) {
    return (
      <>
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg">
              <p>You need to be logged in to access this page. Redirecting to login...</p>
            </div>
          </div>
        )}
      </>
    );
  }

  return <Component {...rest} />;
};

PrivateRoute.propTypes = {
  element: PropTypes.elementType.isRequired,
};

export default PrivateRoute;