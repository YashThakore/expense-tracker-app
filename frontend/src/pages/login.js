// src/pages/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // State to handle error messages
  const navigate = useNavigate(); // Use useNavigate instead of useHistory

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { username, password });
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token); // Store the token in localStorage
        navigate('/dashboard'); // Navigate to dashboard after successful login
      }
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        setError('Network error: Unable to connect to the server. Please try again later.');
      } else if (error.response && error.response.data) {
        setError(error.response.data.error); // Display specific error from the server
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      <Navbar />
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
    </div>
  );
};

export default Login;
