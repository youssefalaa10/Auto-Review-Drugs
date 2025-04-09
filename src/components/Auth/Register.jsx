// src/components/Auth/Register.jsx
import React, { useState } from 'react';
import { FaEnvelope, FaLock, FaUserPlus, FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../firebase';

const Register = ({ setActiveTab }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Username is required';
    if (!email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Minimum 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the form');
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: username });

      toast.success('Registration successful!');
      setActiveTab('login');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister}>
      {/* Username */}
      <div className="form-group">
        <label className="form-label">Username</label>
        <div className={`input-group ${errors.username ? 'input-error' : ''}`}>
          <div className="input-icon"><FaUser /></div>
          <input
            type="text"
            className="form-control"
            placeholder="Enter username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (errors.username) setErrors({ ...errors, username: null });
            }}
          />
        </div>
        {errors.username && <div className="error-message">{errors.username}</div>}
      </div>

      {/* Email */}
      <div className="form-group">
        <label className="form-label">Email</label>
        <div className={`input-group ${errors.email ? 'input-error' : ''}`}>
          <div className="input-icon"><FaEnvelope /></div>
          <input
            type="email"
            className="form-control"
            placeholder="Enter email"
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
            placeholder="Create a password"
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
        {isLoading ? <div className="spinner" /> : <><FaUserPlus className="btn-icon" /> Register</>}
      </motion.button>
    </form>
  );
};

export default Register;
