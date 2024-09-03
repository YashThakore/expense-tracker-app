// src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom'; // Use Navigate instead of Redirect in react-router-dom v6

const PrivateRoute = ({ component: Component, ...rest }) => {
  const isAuthenticated = !!localStorage.getItem('token'); // Check if user is authenticated

  return isAuthenticated ? <Component {...rest} /> : <Navigate to="/login" />;
};

export default PrivateRoute;
