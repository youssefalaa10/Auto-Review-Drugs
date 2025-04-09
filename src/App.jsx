// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import DrugComparison from './components/DrugComparison/DrugComparison'; 
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

const App = () => {
  const [user, setUser] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setCheckingStatus(false);
    });
    return () => unsubscribe();
  }, []);

  if (checkingStatus) return <div>Loading...</div>;

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/drug-comparison"
        element={
          user || sessionStorage.getItem('userEmail') === 'Guest User' ? (
            <DrugComparison />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      {/* Add more routes if needed */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
