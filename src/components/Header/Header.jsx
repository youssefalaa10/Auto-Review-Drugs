import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth'; // 🔥 Import Firebase signOut
import './Header.css'
import sfdaLogo from '../../assets/SfdaLogo.png';
import { auth } from '../../firebase';

const Header = () => {
  const [userEmail, setUserEmail] = useState('User');
  const navigate = useNavigate();

  useEffect(() => {
    const email = sessionStorage.getItem('userEmail');
    if (email) {
      setUserEmail(email);
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth); // ✅ Sign out from Firebase
      sessionStorage.removeItem('userEmail'); // Clear session
      navigate('/');
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Failed to log out. Try again.");
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div>
            <img src={sfdaLogo} alt="SFDA Logo" className="logo" />
          </div>
          <div className="header-right">
            <div className="user-info">
              <div className="user-avatar">
                <i className="fas fa-user"></i>
              </div>
              <span>{userEmail}</span>
            </div>
            <nav>
              <a
                href="https://www.sfda.gov.sa"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link"
              >
                <i className="fas fa-external-link-alt me-1"></i> SFDA
              </a>
              <button onClick={handleLogout} className="nav-link logout-btn">
                <i className="fas fa-sign-out-alt me-1"></i> Log Out
              </button>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
