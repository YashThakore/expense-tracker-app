// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PlaidLink } from 'react-plaid-link';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [linkToken, setLinkToken] = useState('');
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkPlaidConnection = async () => {
      try {
        console.log('Checking if user is connected to Plaid...'); // Debug log
        const response = await axios.get('http://localhost:5000/api/plaid/transactions', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        if (response.data && response.data.length > 0) {
          console.log('Transactions fetched successfully:', response.data); // Log transactions data
          setTransactions(response.data);
          setIsConnected(true);
        } else {
          console.log('No transactions found, fetching link token...');
          fetchLinkToken();
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log('User not connected to Plaid, fetching link token...');
          fetchLinkToken();
        } else {
          setError('Error checking Plaid connection. Please try again.');
          console.error('Error checking Plaid connection:', error.response?.data || error.message || error);
        }
      }
    };

    checkPlaidConnection();
  }, []);

  const fetchLinkToken = async () => {
    try {
      console.log('Fetching link token...');
      const response = await axios.post(
        'http://localhost:5000/api/plaid/create_link_token',
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      if (response.data && response.data.link_token) {
        console.log('Link token fetched:', response.data.link_token); // Debug log
        setLinkToken(response.data.link_token);
      }
    } catch (error) {
      setError('Error fetching link token. Please try again.');
      console.error('Error fetching link token:', error.response?.data || error.message || error);
    }
  };

  const handleOnSuccess = async (public_token) => {
    try {
      console.log('Exchanging public token for access token...'); // Debug log
      const response = await axios.post(
        'http://localhost:5000/api/plaid/exchange_public_token',
        { public_token },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      if (response.data) {
        console.log('Public token exchanged successfully. Fetching transactions...'); // Debug log
        fetchTransactions();
        setIsConnected(true);
      }
    } catch (error) {
      setError('Error exchanging token. Please try again.');
      console.error('Error exchanging token:', error.response?.data || error.message || error);
    }
  };

  const fetchTransactions = async () => {
    try {
      console.log('Fetching transactions...'); // Debug log
      const response = await axios.get('http://localhost:5000/api/plaid/transactions', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.data) {
        console.log('Transactions fetched:', response.data); // Log the response data
        setTransactions(response.data);
      }
    } catch (error) {
      setError('Error fetching transactions. Please try again.');
      console.error('Error fetching transactions:', error.response?.data || error.message || error);
    }
  };

  return (
    <div>
      <Navbar />
      <h2>Dashboard</h2>
      {!isConnected && linkToken && (
        <PlaidLink token={linkToken} onSuccess={handleOnSuccess}>
          Connect a bank account
        </PlaidLink>
      )}
      <h3>Transactions</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
      <ul>
        {transactions.map((transaction) => (
          <li key={transaction.transaction_id}>
            {transaction.merchant_name}: ${transaction.amount}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
