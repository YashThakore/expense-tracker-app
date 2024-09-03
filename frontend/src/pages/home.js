// frontend/src/pages/Home.js
import React from 'react';
import Navbar from '../components/Navbar';

const Home = () => {
  return (
    <div>
      <Navbar />
      <h1>Welcome to Plaid Expenses App</h1>
      <p>Please login or register to continue.</p>
    </div>
  );
};

export default Home;
