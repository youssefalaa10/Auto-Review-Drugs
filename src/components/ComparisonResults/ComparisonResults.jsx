import React from 'react';
import './ComparisonResults.css';
import { 
  FaFileDownload, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaChartPie, 
  FaExchangeAlt, 
  FaArrowDown 
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const ComparisonResults = ({ score, genericName, nceName, onDownload }) => {
  // Determine if the score is considered compatible (above 75%)
  const isCompatible = score >= 75;
  const scoreClass = isCompatible ? 'compatible' : 'incompatible';
  const statusText = isCompatible ? 'COMPATIBLE' : 'INCOMPATIBLE';
  const statusClass = isCompatible ? 'bg-success' : 'bg-danger';
  const textClass = isCompatible ? 'compatible-text' : 'incompatible-text';
  const StatusIcon = isCompatible ? FaCheckCircle : FaTimesCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="results-wrapper"
    >
      {/* Similarity Score */}
      <motion.div 
        className="score-container"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
      >
        <button className={`score-box ${scoreClass}`}>
          <FaChartPie className="me-2" />
          Similarity Score: <span id="scoreValue" className="score-value">{score}</span>%
        </button>
      </motion.div>

      {/* Comparison Container */}
      <div className="upload-container shadow-sm">
        {/* Labels for Each Drug */}
        <div className="upload-labels">
          <div className="drug-label">
            <h2>Generic Drug: <span className="drug-name">{genericName}</span></h2>
          </div>
          <div className="comparison-icon">
            <FaExchangeAlt />
          </div>
          <div className="drug-label">
            <h2>NCE Drug: <span className="drug-name">{nceName}</span></h2>
          </div>
        </div>

        {/* Status indicators */}
        <div className="status-indicators">
          <div className="status-badge">
            <span className={`badge ${statusClass}`}>
              <StatusIcon className="me-1" />
              {statusText}
            </span>
          </div>
          <div className="status-badge">
            <span className={`badge ${statusClass}`}>
              <StatusIcon className="me-1" />
              {statusText}
            </span>
          </div>
        </div>

        {/* Comparison Results */}
        <div className="comparison-results">
          <div className="section-comparison">
            <div className="section-header">
              <span><FaArrowDown className="me-2" />Comparison Complete</span>
              <span className={`section-score ${statusClass}`}>{score}%</span>
            </div>
            <div className="section-content">
              <p>
                The overall similarity between the generic drug and the NCE drug is 
                <strong className={textClass}> {score}%</strong>.
              </p>
              
              <p>
                Based on the analysis, these drugs are 
                <strong className={textClass}> {statusText}</strong>.
              </p>
              
              <p>
                For detailed section-by-section comparison results, please download the full report using 
                the button below.
              </p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <motion.div 
          className="download-links"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <button className="download-btn" onClick={onDownload}>
            <FaFileDownload className="me-2" /> Download Comparison Report
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ComparisonResults;