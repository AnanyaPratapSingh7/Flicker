import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const location = useLocation();
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">ParadyzeV2</span>
        </Link>
        
        <div className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/agent-launchpad" className={`nav-link ${location.pathname === '/agent-launchpad' ? 'active' : ''}`}>
            Agent Launchpad
          </Link>
          <Link to="/prediction-market" className={`nav-link ${location.pathname === '/prediction-market' ? 'active' : ''}`}>
            Prediction Market
          </Link>
          <Link to="/money-market" className={`nav-link ${location.pathname === '/money-market' ? 'active' : ''}`}>
            Money Market
          </Link>
        </div>
        
        <div className="nav-actions">
          <button className="connect-wallet-btn">Connect Wallet</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
