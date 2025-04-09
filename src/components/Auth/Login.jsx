// src/components/Auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSignInAlt, FaUser, FaUserPlus
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import './Auth.css';
import sfdaLogo from '../../assets/sfda_logo.svg';
import Register from './Register';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('login');

  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email';

    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      sessionStorage.setItem('userEmail', userCredential.user.email);
      toast.success('Login successful!');
      navigate('/drug-comparison');
    } catch (error) {
      toast.error('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    await new Promise(res => setTimeout(res, 500));
    sessionStorage.setItem('userEmail', 'Guest User');
    toast.success('Logged in as guest');
    navigate('/drug-comparison');
    setIsLoading(false);
  };

  return (
    <div className="login-body">
      <motion.div className="login-container">
        <div className="login-header">
          <div className="logo-container">
            <img src={sfdaLogo} alt="Logo" className="colored-logo" />
          </div>
          <h2>AutoReview</h2>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            <FaSignInAlt className="tab-icon" /> Login
          </button>
          <button
            className={`tab-button ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            <FaUserPlus className="tab-icon" /> Register
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === 'login' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeTab === 'login' ? 20 : -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'login' ? (
              <form onSubmit={handleLogin}>
                {/* Email */}
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <div className={`input-group ${errors.email ? 'input-error' : ''}`}>
                    <div className="input-icon"><FaEnvelope /></div>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: null });
                      }}
                    />
                  </div>
                  {errors.email && <div className="error-message">{errors.email}</div>}
                </div>

                {/* Password */}
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className={`password-input-group ${errors.password ? 'input-error' : ''}`}>
                    <div className="input-icon"><FaLock /></div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors({ ...errors, password: null });
                      }}
                    />
                    <div className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </div>
                  </div>
                  {errors.password && <div className="error-message">{errors.password}</div>}
                </div>

                <motion.button
                  type="submit"
                  className={`login-btn ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? <div className="spinner" /> : <><FaSignInAlt className="btn-icon" /> Login</>}
                </motion.button>
              </form>
            ) : (
              <Register setActiveTab={setActiveTab} />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="divider">
          <div className="divider-line"></div>
          <div className="divider-text">OR</div>
          <div className="divider-line"></div>
        </div>

        <motion.button
          type="button"
          className={`guest-btn ${isLoading ? 'loading' : ''}`}
          onClick={handleGuestLogin}
          disabled={isLoading}
        >
          {isLoading ? <div className="spinner dark" /> : <><FaUser className="btn-icon" /> Continue as Guest</>}
        </motion.button>

        <div className="login-footer">
          <p>© 2025 SFDA AutoReview System</p>
        </div>
      </motion.div>
      <Toaster position="top-right" />
    </div>
  );
};

export default Login;
