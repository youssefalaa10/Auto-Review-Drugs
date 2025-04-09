import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { RiUploadCloud2Line } from "react-icons/ri";
import { LuFileText } from "react-icons/lu";
import { IoChevronDown } from "react-icons/io5";
import { LuSearch } from "react-icons/lu";
import { FiRefreshCw } from "react-icons/fi";
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import ComparisonResults from '../ComparisonResults/ComparisonResults';
import './DrugComparison.css';

const DrugComparison = () => {
  const navigate = useNavigate();
  const [pdfFile, setPdfFile] = useState(null);
  const [scientificName, setScientificName] = useState('');
  const [strength, setStrength] = useState('');
  const [dosageForm, setDosageForm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [comparisonScore, setComparisonScore] = useState(87.5);
  const [genericDrugName, setGenericDrugName] = useState('');
  const [nceDrugName, setNceDrugName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  // List of available drugs and their strengths
  const drugOptions = [
    { value: 'Paracetamol', label: 'Paracetamol' },
    { value: 'Ibuprofen', label: 'Ibuprofen' },
    { value: 'Amoxicillin', label: 'Amoxicillin' },
    { value: 'Omeprazole', label: 'Omeprazole' },
    { value: 'Atorvastatin', label: 'Atorvastatin' },
    { value: 'Metformin', label: 'Metformin' },
    { value: 'Amlodipine', label: 'Amlodipine' },
    { value: 'Diazepam', label: 'Diazepam' },
    { value: 'Aspirin', label: 'Aspirin' },
    { value: 'Lisinopril', label: 'Lisinopril' }
  ];

  const dosageFormOptions = [
    { value: 'Tablet', label: 'Tablet' },
    { value: 'Capsule', label: 'Capsule' },
    { value: 'Oral Solution', label: 'Oral Solution' },
    { value: 'Syrup', label: 'Syrup' },
    { value: 'Suspension', label: 'Suspension' },
    { value: 'Injection', label: 'Injection' },
    { value: 'Cream', label: 'Cream' },
    { value: 'Ointment', label: 'Ointment' },
    { value: 'Gel', label: 'Gel' }
  ];

  // Strength options based on selected drug
  const getStrengthOptions = (drug) => {
    switch(drug) {
      case 'Paracetamol':
        return [
          { value: '500 mg', label: '500 mg' },
          { value: '250 mg', label: '250 mg' },
          { value: '125 mg', label: '125 mg' }
        ];
      case 'Ibuprofen':
        return [
          { value: '400 mg', label: '400 mg' },
          { value: '200 mg', label: '200 mg' },
          { value: '100 mg', label: '100 mg' }
        ];
      case 'Amoxicillin':
        return [
          { value: '500 mg', label: '500 mg' },
          { value: '250 mg', label: '250 mg' },
          { value: '125 mg', label: '125 mg' }
        ];
      case 'Omeprazole':
        return [
          { value: '40 mg', label: '40 mg' },
          { value: '20 mg', label: '20 mg' },
          { value: '10 mg', label: '10 mg' }
        ];
      case 'Atorvastatin':
        return [
          { value: '80 mg', label: '80 mg' },
          { value: '40 mg', label: '40 mg' },
          { value: '20 mg', label: '20 mg' },
          { value: '10 mg', label: '10 mg' }
        ];
      default:
        return [
          { value: '100 mg', label: '100 mg' },
          { value: '50 mg', label: '50 mg' },
          { value: '25 mg', label: '25 mg' },
          { value: '10 mg', label: '10 mg' },
          { value: '5 mg', label: '5 mg' }
        ];
    }
  };

  // NCE name mapping
  const getNceName = (scientificName) => {
    const nceNames = {
      'Paracetamol': 'Panadol Extra Strength',
      'Ibuprofen': 'Advil',
      'Amoxicillin': 'Amoxil',
      'Omeprazole': 'Prilosec',
      'Atorvastatin': 'Lipitor',
      'Metformin': 'Glucophage',
      'Amlodipine': 'Norvasc',
      'Diazepam': 'Valium',
      'Aspirin': 'Bayer Aspirin',
      'Lisinopril': 'Zestril'
    };
    
    return nceNames[scientificName] || 'Reference Drug';
  };

  useEffect(() => {
    // Check if user is logged in
    const userEmail = sessionStorage.getItem('userEmail');
    if (!userEmail) {
      navigate('/');
      toast.error('Please log in to access this page');
    }

    // Check if URL contains "demo" parameter
    if (window.location.href.includes('demo')) {
      setShowResults(true);
    }
  }, [navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setPdfFile(file);
        toast.success(`File "${file.name}" uploaded successfully`);
      } else {
        toast.error('Please upload a PDF file');
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setPdfFile(file);
        toast.success(`File "${file.name}" uploaded successfully`);
      } else {
        toast.error('Please upload a PDF file');
      }
    }
  };

  const handleScientificNameChange = (e) => {
    setScientificName(e.target.value);
    setStrength(''); // Reset strength when drug changes
  };

  const handleCompare = () => {
    // Form validation
    if (!pdfFile || !scientificName || !strength || !dosageForm) {
      toast.error('Please fill in all required fields and upload a PDF file');
      return;
    }

    setIsLoading(true);
    
    // Set generic and NCE drug names
    const genericName = `${scientificName} ${strength} ${dosageForm}`;
    const nceName = getNceName(scientificName);
    
    setGenericDrugName(genericName);
    setNceDrugName(nceName);

    // Simulate API call with toast notification
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
          setIsLoading(false);
          setShowResults(true);
          
          // Scroll to results
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }, 2000);
      }),
      {
        loading: 'Processing your comparison...',
        success: 'Comparison completed successfully!',
        error: 'Error processing comparison',
      }
    );
  };

  const handleDownloadReport = () => {
    toast.success('Report download started');
  };

  const resetForm = () => {
    setPdfFile(null);
    setScientificName('');
    setStrength('');
    setDosageForm('');
    setShowResults(false);
    toast.success('Form has been reset');
  };

  return (
    <div className="drug-comparison-page">
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            style: {
              background: '#EDF7ED',
              color: '#1E4620',
              border: '1px solid #C3E6CB'
            },
          },
          error: {
            style: {
              background: '#FDEDED',
              color: '#5F2120',
              border: '1px solid #F5C2C7'
            },
          },
          loading: {
            style: {
              background: '#EFF8FF', 
              color: '#0A558C',
              border: '1px solid #BEE3F8'
            },
          }
        }}
      />
      
      <Header />
      
      <div className="container mt-4">
        {/* File Upload Form */}
        {!isLoading && !showResults && (
          <div className="upload-container shadow-sm" id="uploadForm">
            <h2 className="text-center gradient-text mb-4">Generic Drug Comparison Tool</h2>
            
            <form id="drugComparisonForm">
              <div className="row mb-4">
                <div className="col-md-6">
                  <div 
                    className={`file-upload-drag ${isDragging ? 'dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="file-upload-content">
                      <RiUploadCloud2Line size={40} className="upload-icon" />
                      <label htmlFor="pdfFile" className="form-label mt-3">Upload Generic Drug SPC (PDF)</label>
                      <p className="text-muted small">Drag and drop your file here, or click to browse</p>
                      
                      <input 
                        type="file" 
                        className="form-control visually-hidden" 
                        id="pdfFile" 
                        accept=".pdf" 
                        required
                        onChange={handleFileChange}
                      />
                      
                      <button 
                        type="button" 
                        className="btn btn-outline-primary mt-2"
                        onClick={() => document.getElementById('pdfFile').click()}
                      >
                        Select File
                      </button>
                      
                      {pdfFile && (
                        <div className="selected-file mt-3">
                          <LuFileText size={18} className="me-2" />
                          <span>{pdfFile.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="drug-selection-container">
                    <div className="mb-3">
                      <label htmlFor="scientificName" className="form-label">Scientific Name</label>
                      <div className="custom-select-wrapper">
                        <LuSearch size={18} className="select-icon" />
                        <select 
                          className="form-select custom-select" 
                          id="scientificName" 
                          required
                          value={scientificName}
                          onChange={handleScientificNameChange}
                        >
                          <option value="" disabled>Search or select Scientific Name</option>
                          {drugOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                        <IoChevronDown size={18} className="select-arrow" />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label htmlFor="strength" className="form-label">Strength</label>
                          <div className="custom-select-wrapper">
                            <select 
                              className="form-select custom-select" 
                              id="strength" 
                              required
                              value={strength}
                              onChange={(e) => setStrength(e.target.value)}
                              disabled={!scientificName}
                            >
                              <option value="" disabled>Select Strength</option>
                              {scientificName && getStrengthOptions(scientificName).map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                            <IoChevronDown size={18} className="select-arrow" />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label htmlFor="dosageForm" className="form-label">Dosage Form</label>
                          <div className="custom-select-wrapper">
                            <select 
                              className="form-select custom-select" 
                              id="dosageForm" 
                              required
                              value={dosageForm}
                              onChange={(e) => setDosageForm(e.target.value)}
                            >
                              <option value="" disabled>Select Dosage Form</option>
                              {dosageFormOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                            <IoChevronDown size={18} className="select-arrow" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn action-btn me-3" onClick={handleCompare}>
                  <FiRefreshCw size={18} className="me-2" /> Compare with NCE Drug
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                  Reset Form
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="loading-container">
            <div className="spinner-pulse"></div>
            <p className="gradient-text mt-4">Analyzing drug specifications...</p>
          </div>
        )}
        
        {/* Results Section */}
        {showResults && (
          <ComparisonResults 
            score={comparisonScore}
            genericName={genericDrugName || `${scientificName} ${strength} ${dosageForm}`}
            nceName={nceDrugName || getNceName(scientificName)}
            onDownload={handleDownloadReport}
            onRestart={() => {
              setShowResults(false);
              resetForm();
            }}
          />
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default DrugComparison;