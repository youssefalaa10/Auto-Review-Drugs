import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { RiUploadCloud2Line } from "react-icons/ri";
import { LuFileText } from "react-icons/lu";
import { IoChevronDown } from "react-icons/io5";
import { LuSearch } from "react-icons/lu";
import { FiRefreshCw } from "react-icons/fi";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, child } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import ComparisonResults from '../ComparisonResults/ComparisonResults';
import './DrugComparison.css';

const DrugComparison = () => {
  const navigate = useNavigate();
  const [pdfFile, setPdfFile] = useState(null);
  const [scientificName, setScientificName] = useState('');
  const [strength, setStrength] = useState('');
  const [doesageForm, setDoesageForm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [comparisonScore, setComparisonScore] = useState(87.5);
  const [genericDrugName, setGenericDrugName] = useState('');
  const [nceDrugName, setNceDrugName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  // Firebase data states
  const [drugsData, setDrugsData] = useState([]);
  const [drugOptions, setDrugOptions] = useState([]);
  const [doesageFormOptions, setDoesageFormOptions] = useState([]);
  const [availableStrengths, setAvailableStrengths] = useState([]);

  // Search state for each dropdown
  const [scientificNameSearch, setScientificNameSearch] = useState('');
  const [strengthSearch, setStrengthSearch] = useState('');
  const [doesageFormSearch, setDoesageFormSearch] = useState('');
  
  // Dropdown visibility state
  const [showScientificNameDropdown, setShowScientificNameDropdown] = useState(false);
  const [showStrengthDropdown, setShowStrengthDropdown] = useState(false);
  const [showDoesageFormDropdown, setShowDoesageFormDropdown] = useState(false);

  // Database
  const database = getDatabase();
  const auth = getAuth();

  // NCE name mapping
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

  // Check authentication status and fetch data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        console.log("User authenticated:", user.email);
      } else {
        setIsAuthenticated(false);
        const userEmail = sessionStorage.getItem('userEmail');
        if (!userEmail) {
          navigate('/');
          toast.error('Please log in to access this page');
        }
      }
    });

    // Fetch drugs data regardless of auth state (rules should handle permissions)
    fetchDrugsData();

    // Check if URL contains "demo" parameter
    if (window.location.href.includes('demo')) {
      setShowResults(true);
    }

    // Close dropdowns when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest('.custom-select-container')) {
        setShowScientificNameDropdown(false);
        setShowStrengthDropdown(false);
        setShowDoesageFormDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [navigate, auth]);
  
  // Debug function to log Firebase data structure
  const debugFirebaseData = async () => {
    try {
      const dbRef = ref(database);
      // Get the root data to examine structure
      const snapshot = await get(dbRef);
      
      if (snapshot.exists()) {
        console.log("Firebase Database Structure:", snapshot.val());
      } else {
        console.log("No data available in Firebase");
      }
    } catch (error) {
      console.error("Error checking database structure:", error);
    }
  };

  // Fallback data for when Firebase access fails or for demo mode
  const loadFallbackData = () => {
    console.log("Loading fallback data");
    const fallbackDrugs = [
      { scientificName: 'Paracetamol', doesageForm: 'Tablet', strength: '500 mg' },
      { scientificName: 'Paracetamol', doesageForm: 'Tablet', strength: '250 mg' },
      { scientificName: 'Paracetamol', doesageForm: 'Syrup', strength: '125 mg/5ml' },
      { scientificName: 'Ibuprofen', doesageForm: 'Capsule', strength: '200 mg' },
      { scientificName: 'Ibuprofen', doesageForm: 'Tablet', strength: '400 mg' },
      { scientificName: 'Amoxicillin', doesageForm: 'Capsule', strength: '500 mg' },
      { scientificName: 'Amoxicillin', doesageForm: 'Suspension', strength: '250 mg/5ml' },
      { scientificName: 'Omeprazole', doesageForm: 'Capsule', strength: '20 mg' },
      { scientificName: 'Atorvastatin', doesageForm: 'Tablet', strength: '10 mg' },
      { scientificName: 'Atorvastatin', doesageForm: 'Tablet', strength: '20 mg' }
    ];

    setDrugsData(fallbackDrugs);
    
    // Extract unique scientific names for dropdown and ensure each has a unique value
    const uniqueNames = [...new Set(fallbackDrugs.map(drug => drug.scientificName))];
    setDrugOptions(uniqueNames.map((name, index) => ({ 
      value: name, 
      label: name,
      id: `drug-${index}` // Add an id for uniqueness
    })));
    
    // Extract unique dosage forms for dropdown
    const uniqueDoesageForms = [...new Set(fallbackDrugs.map(drug => drug.doesageForm))];
    setDoesageFormOptions(uniqueDoesageForms.map((form, index) => ({ 
      value: form, 
      label: form,
      id: `form-${index}` 
    })));
    
    setIsDataLoading(false);
  };

  const fetchDrugsData = async () => {
    setIsDataLoading(true);
    
    // Debug the database structure
    debugFirebaseData();
    
    try {
      console.log("Attempting to fetch drugs data...");
      const dbRef = ref(database);
      
      // First try with direct path
      let snapshot = await get(child(dbRef, 'drugs'));
      
      // If no data found, try without 'drugs' path (in case it's at root level)
      if (!snapshot.exists()) {
        console.log("No data at 'drugs' path. Checking root level...");
        snapshot = await get(dbRef);
      }
      
      if (snapshot.exists()) {
        console.log("Raw data fetched:", snapshot.val());
        
        let data;
        // If we got data at the 'drugs' path
        if (snapshot.hasChild('drugs')) {
          data = snapshot.child('drugs').val();
          console.log("Data found in 'drugs' path:", data);
        } else {
          // If data is at root level or has different structure
          data = snapshot.val();
          // Check if data itself is the drugs object, or contains a drugs property
          if (data.drugs) {
            data = data.drugs;
            console.log("Data found in root.drugs:", data);
          } else {
            console.log("Using root data directly:", data);
          }
        }
        
        // Convert Firebase object to array, handling different data structures
        let drugsArray = [];
        
        if (Array.isArray(data)) {
          // If it's already an array
          drugsArray = data;
        } else if (typeof data === 'object') {
          // If it's an object with numeric keys (common Firebase structure)
          drugsArray = Object.values(data);
        }
        
        console.log("Processed drugs array:", drugsArray);
        
        if (drugsArray.length > 0) {
          setDrugsData(drugsArray);
          
          // Extract unique scientific names for dropdown
          const uniqueNames = [...new Set(drugsArray.map(drug => {
            // Handle different property name formats
            return drug.scientificName || drug.ScientificName || drug.scientific_name || '';
          }).filter(name => name !== ''))];
          
          console.log("Unique drug names:", uniqueNames);
          
          // Add unique ids to each option
          setDrugOptions(uniqueNames.map((name, index) => ({ 
            value: name, 
            label: name,
            id: `drug-${index}` // Add an id for uniqueness
          })));
          
          // Extract unique dosage forms for dropdown
          const uniqueDoesageForms = [...new Set(drugsArray.map(drug => {
            // Handle different property name formats
            return drug.doesageForm || drug.DoesageForm || drug.dosage_form || '';
          }).filter(form => form !== ''))];
          
          console.log("Unique dosage forms:", uniqueDoesageForms);
          
          // Add unique ids to each option
          setDoesageFormOptions(uniqueDoesageForms.map((form, index) => ({ 
            value: form, 
            label: form,
            id: `form-${index}` // Add an id for uniqueness
          })));
          
          toast.success("Drug data loaded successfully");
        } else {
          console.log("Drugs array is empty");
          toast.error("No drugs data found");
          loadFallbackData();
        }
      } else {
        console.log("No drugs data available in the database");
        toast.error("No drugs data found");
        loadFallbackData();
      }
    } catch (error) {
      console.error("Error fetching drugs data:", error);
      
      if (error.message.includes("Permission denied")) {
        toast.error("Permission denied: Please check Firebase rules");
      } else {
        toast.error("Error loading drugs data: " + error.message);
      }
      
      // Load fallback data on error
      loadFallbackData();
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    // Update available strengths when scientific name changes
    if (scientificName && drugsData.length > 0) {
      const strengthsForDrug = drugsData
        .filter(drug => {
          const drugName = drug.scientificName || drug.ScientificName || drug.scientific_name || '';
          return drugName === scientificName;
        })
        .map(drug => drug.strength || drug.Strength || drug.drug_strength || '');
      
      const uniqueStrengths = [...new Set(strengthsForDrug)].filter(s => s !== '');
      // Add unique ids to each option
      setAvailableStrengths(uniqueStrengths.map((strength, index) => ({ 
        value: strength, 
        label: strength,
        id: `strength-${index}` // Add an id for uniqueness
      })));
    }
  }, [scientificName, drugsData]);

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

  // Select handlers for custom dropdowns
  const handleSelectScientificName = (value) => {
    setScientificName(value);
    setStrength(''); // Reset strength when drug changes
    setShowScientificNameDropdown(false);
    setScientificNameSearch(''); // Clear search after selection
  };

  const handleSelectStrength = (value) => {
    setStrength(value);
    setShowStrengthDropdown(false);
    setStrengthSearch(''); // Clear search after selection
  };

  const handleSelectDoesageForm = (value) => {
    setDoesageForm(value);
    setShowDoesageFormDropdown(false);
    setDoesageFormSearch(''); // Clear search after selection
  };

  // Filter options based on search input
  const filteredDrugOptions = drugOptions.filter(option => 
    option.label.toLowerCase().includes(scientificNameSearch.toLowerCase())
  );

  const filteredStrengthOptions = availableStrengths.filter(option => 
    option.label.toLowerCase().includes(strengthSearch.toLowerCase())
  );

  const filteredDoesageFormOptions = doesageFormOptions.filter(option => 
    option.label.toLowerCase().includes(doesageFormSearch.toLowerCase())
  );

  const getNceName = (scientificName) => {
    return nceNames[scientificName] || 'Reference Drug';
  };

  const handleCompare = () => {
    // Form validation
    if (!pdfFile || !scientificName || !strength || !doesageForm) {
      toast.error('Please fill in all required fields and upload a PDF file');
      return;
    }

    setIsLoading(true);
    
    // Set generic and NCE drug names
    const genericName = `${scientificName} ${strength} ${doesageForm}`;
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
    setDoesageForm('');
    setShowResults(false);
    toast.success('Form has been reset');
  };

  // Button to manually retry data loading
  const handleRetryLoad = () => {
    toast.info("Retrying data load...");
    fetchDrugsData();
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
          },
          info: {
            style: {
              background: '#E6F6FF',
              color: '#0A558C',
              border: '1px solid #BEE3F8'
            },
          }
        }}
      />
      
      <Header />
      
      <div className="container mt-4">
        {/* Data loading indicator */}
        {isDataLoading && (
          <div className="alert alert-info d-flex align-items-center" role="alert">
            <div className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div>
              Loading drug data...
            </div>
          </div>
        )}
        
        {/* Retry button for data loading issues */}
        {!isDataLoading && drugsData.length === 0 && (
          <div className="alert alert-warning d-flex align-items-center justify-content-between" role="alert">
            <div>
              Failed to load drug data. Using fallback data instead.
            </div>
            <button className="btn btn-sm btn-outline-primary" onClick={handleRetryLoad}>
              Retry Loading
            </button>
          </div>
        )}
        
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
                    {/* Scientific Name Custom Searchable Dropdown */}
                    <div className="mb-3">
                      <label htmlFor="scientificName" className="form-label">Scientific Name</label>
                      <div className="custom-select-container" tabIndex="0">
                        <div 
                          className="custom-select-wrapper"
                          onClick={() => setShowScientificNameDropdown(!showScientificNameDropdown)}
                        >
                          <div className="search-input-wrapper">
                            <LuSearch size={18} className="select-icon" />
                            <input
                              type="text"
                              className="form-control custom-search-input"
                              placeholder="Search or select Scientific Name"
                              value={scientificNameSearch || scientificName}
                              onChange={e => {
                                setScientificNameSearch(e.target.value);
                                setShowScientificNameDropdown(true);
                              }}
                              onFocus={() => setShowScientificNameDropdown(true)}
                            />
                          </div>
                          <IoChevronDown size={18} className={`select-arrow ${showScientificNameDropdown ? 'rotated' : ''}`} />
                        </div>
                        
                        {showScientificNameDropdown && (
                          <div className="custom-select-dropdown">
                            {filteredDrugOptions.length > 0 ? (
                              filteredDrugOptions.map(option => (
                                <div 
                                  key={option.id || option.value} 
                                  className={`dropdown-item ${scientificName === option.value ? 'selected' : ''}`}
                                  onClick={() => handleSelectScientificName(option.value)}
                                >
                                  {option.label}
                                </div>
                              ))
                            ) : (
                              <div className="dropdown-item no-results">No results found</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6">
                        {/* Strength Custom Searchable Dropdown */}
                        <div className="mb-3">
                          <label htmlFor="strength" className="form-label">Strength</label>
                          <div className="custom-select-container" tabIndex="0">
                            <div 
                              className={`custom-select-wrapper ${!scientificName ? 'disabled' : ''}`}
                              onClick={() => scientificName && setShowStrengthDropdown(!showStrengthDropdown)}
                            >
                              <div className="search-input-wrapper">
                                <input
                                  type="text"
                                  className="form-control custom-search-input"
                                  placeholder="Select Strength"
                                  value={strengthSearch || strength}
                                  onChange={e => {
                                    setStrengthSearch(e.target.value);
                                    setShowStrengthDropdown(true);
                                  }}
                                  disabled={!scientificName}
                                  onFocus={() => scientificName && setShowStrengthDropdown(true)}
                                />
                              </div>
                              <IoChevronDown size={18} className={`select-arrow ${showStrengthDropdown ? 'rotated' : ''}`} />
                            </div>
                            
                            {showStrengthDropdown && (
                              <div className="custom-select-dropdown">
                                {filteredStrengthOptions.length > 0 ? (
                                  filteredStrengthOptions.map(option => (
                                    <div 
                                      key={option.id || `strength-${option.value}`} 
                                      className={`dropdown-item ${strength === option.value ? 'selected' : ''}`}
                                      onClick={() => handleSelectStrength(option.value)}
                                    >
                                      {option.label}
                                    </div>
                                  ))
                                ) : (
                                  <div className="dropdown-item no-results">No results found</div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        {/* Dosage Form Custom Searchable Dropdown */}
                        <div className="mb-3">
                          <label htmlFor="doesageForm" className="form-label">Dosage Form</label>
                          <div className="custom-select-container" tabIndex="0">
                            <div 
                              className="custom-select-wrapper"
                              onClick={() => setShowDoesageFormDropdown(!showDoesageFormDropdown)}
                            >
                              <div className="search-input-wrapper">
                                <input
                                  type="text"
                                  className="form-control custom-search-input"
                                  placeholder="Select Dosage Form"
                                  value={doesageFormSearch || doesageForm}
                                  onChange={e => {
                                    setDoesageFormSearch(e.target.value);
                                    setShowDoesageFormDropdown(true);
                                  }}
                                  onFocus={() => setShowDoesageFormDropdown(true)}
                                />
                              </div>
                              <IoChevronDown size={18} className={`select-arrow ${showDoesageFormDropdown ? 'rotated' : ''}`} />
                            </div>
                            
                            {showDoesageFormDropdown && (
                              <div className="custom-select-dropdown">
                                {filteredDoesageFormOptions.length > 0 ? (
                                  filteredDoesageFormOptions.map(option => (
                                    <div 
                                      key={option.id || `form-${option.value}`} 
                                      className={`dropdown-item ${doesageForm === option.value ? 'selected' : ''}`}
                                      onClick={() => handleSelectDoesageForm(option.value)}
                                    >
                                      {option.label}
                                    </div>
                                  ))
                                ) : (
                                  <div className="dropdown-item no-results">No results found</div>
                                )}
                              </div>
                            )}
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
            genericName={genericDrugName || `${scientificName} ${strength} ${doesageForm}`}
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