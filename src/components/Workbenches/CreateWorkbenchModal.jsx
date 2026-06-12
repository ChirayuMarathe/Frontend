import React, { useState } from 'react';
import { X, Building2, MapPin, ShieldCheck, CreditCard, ChevronRight, ChevronLeft, Globe, DollarSign, Clock, Check, ArrowRight, RefreshCw, Plus } from 'lucide-react';
import { backendService } from '../../services/backendService';

const CreateWorkbenchModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    // Part 1: Company Info
    name: '',
    industry: 'services',
    sector: 'technology',
    business_type: 'pvt_ltd',
    // Part 2: Location
    location: 'India',
    currency: 'INR',
    // Part 3: Legal and Compliance
    legal_name: '',
    pan: '',
    gstin: '',
    incorporation_date: '',
    // Part 4: Books and Start
    fy_start: '',
    books_start_date: new Date().toISOString().split('T')[0],
    coa_mode: 'create', // create or import
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isStepValid = () => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}[A-Z]{1}[0-9A-Z]{1}$/;

    switch (step) {
      case 1:
        return formData.name.trim() !== '' && formData.industry !== '' && formData.sector !== '' && formData.business_type !== '';
      case 2:
        return formData.location.trim() !== '' && formData.currency.trim() !== '';
      case 3:
        const vPan = formData.pan.trim().toUpperCase();
        const vGstin = formData.gstin.trim().toUpperCase();
        return (
          formData.legal_name.trim() !== '' &&
          panRegex.test(vPan) &&
          (!vGstin || gstinRegex.test(vGstin)) &&
          formData.incorporation_date !== ''
        );
      case 4:
        return formData.books_start_date !== '';
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (isStepValid()) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isStepValid() || step < 4) return;

    setLoading(true);
    setError(null);

    try {
      const { name, books_start_date, ...extraData } = formData;
      const workbench = await backendService.createWorkbench(
        name.trim(),
        books_start_date,
        `Workbench for ${name.trim()}`,
        extraData
      );

      onSuccess(workbench);
      onClose();
      // Reset state
      setStep(1);
      setFormData({
        name: '',
        industry: 'services',
        sector: 'technology',
        business_type: 'pvt_ltd',
        location: 'India',
        currency: 'INR',
        legal_name: '',
        pan: '',
        gstin: '',
        incorporation_date: '',
        fy_start: '',
        books_start_date: new Date().toISOString().split('T')[0],
        coa_mode: 'create',
      });
    } catch (err) {
      console.error("Error creating workbench:", err);
      setError(err.message || "Failed to create workbench");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: 'Company Info', icon: <Building2 size={18} /> },
    { title: 'Location', icon: <Globe size={18} /> },
    { title: 'Legal & Compliance', icon: <ShieldCheck size={18} /> },
    { title: 'Books & Start', icon: <Clock size={18} /> },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content glass">
        <button className="close-btn" onClick={onClose}><X size={20} /></button>

        <div className="modal-header">
          <h2>Create New Workbench</h2>
          <div className="step-progress">
            {steps.map((s, i) => (
              <div key={i} className={`step-item ${step > i + 1 ? 'completed' : ''} ${step === i + 1 ? 'active' : ''}`}>
                <div className="step-icon">{s.icon}</div>
                <span className="step-title">{s.title}</span>
                {i < steps.length - 1 && <div className="step-line"></div>}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div className="error-notice">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="form-step">
              <div className="form-grid">
                <div className="form-group span-2">
                  <label>Workbench Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Acme Corp Finance" required />
                </div>
                <div className="form-group">
                  <label>Business Industry</label>
                  <select name="industry" value={formData.industry} onChange={handleChange}>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="services">Services</option>
                    <option value="trading">Trading</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="others">Others</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Sector</label>
                  <select name="sector" value={formData.sector} onChange={handleChange}>
                    <option value="construction">Construction</option>
                    <option value="finance">Finance</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="technology">Technology</option>
                    <option value="education">Education</option>
                    <option value="real_estate">Real Estate</option>
                    <option value="others">Others</option>
                  </select>
                </div>
                <div className="form-group span-2">
                  <label>Business Type</label>
                  <select name="business_type" value={formData.business_type} onChange={handleChange}>
                    <option value="proprietorship">Proprietorship</option>
                    <option value="partnership">Partnership</option>
                    <option value="pvt_ltd">Private Limited (Pvt Ltd)</option>
                    <option value="llp">LLP</option>
                    <option value="public_ltd">Public Limited</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <div className="form-grid">
                <div className="form-group">
                  <label><Globe size={14} /> Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. India" />
                </div>
                <div className="form-group">
                  <label><DollarSign size={14} /> Currency</label>
                  <input type="text" name="currency" value={formData.currency} onChange={handleChange} placeholder="e.g. INR" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step">
              <div className="form-grid">
                <div className="form-group span-2">
                  <label>Legal Entity Name *</label>
                  <input type="text" name="legal_name" value={formData.legal_name} onChange={handleChange} placeholder="Full legal name" required />
                </div>
                <div className="form-group">
                  <label>PAN *</label>
                  <input type="text" name="pan" value={formData.pan} onChange={handleChange} placeholder="ABCDE1234F" required />
                </div>
                <div className="form-group">
                  <label>GSTIN</label>
                  <input type="text" name="gstin" value={formData.gstin} onChange={handleChange} placeholder="22AAAAA0000A1Z5" />
                </div>
                <div className="form-group span-2">
                  <label>Date of Incorporation *</label>
                  <input type="date" name="incorporation_date" value={formData.incorporation_date} onChange={handleChange} required />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="form-step">
              <div className="form-grid">
                <div className="form-group">
                  <label>Financial Year Start *</label>
                  <select name="fy_start" value={formData.fy_start} onChange={handleChange}>
                    <option value="April">April</option>
                    <option value="January">January</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Books Start Date *</label>
                  <input type="date" name="books_start_date" value={formData.books_start_date} onChange={handleChange} required />
                </div>
                <div className="form-group span-2">
                  <label>Chart of Accounts Setup</label>
                  <div className="coa-type-selector">
                    <div 
                      className={`coa-option ${formData.coa_mode === 'create' ? 'active' : ''}`}
                      onClick={() => setFormData({...formData, coa_mode: 'create'})}
                    >
                      <div className="option-icon"><Plus size={18} /></div>
                      <div className="option-info">
                        <strong>Create New</strong>
                        <span>Build 4-layer architecture</span>
                      </div>
                    </div>
                    <div 
                      className={`coa-option ${formData.coa_mode === 'import' ? 'active' : ''}`}
                      onClick={() => setFormData({...formData, coa_mode: 'import'})}
                    >
                      <div className="option-icon"><ArrowRight size={18} /></div>
                      <div className="option-info">
                        <strong>Import COA</strong>
                        <span>From CSV or Zoho</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="modal-footer">
            {step > 1 && (
              <button type="button" className="back-btn" onClick={handleBack}>
                <ChevronLeft size={18} /> Back
              </button>
            )}
            <div className="spacer"></div>
            {step < 4 ? (
              <button
                type="button"
                className={`next-btn ${!isStepValid() ? 'disabled' : ''}`}
                onClick={handleNext}
                disabled={!isStepValid()}
              >
                Next Step <ChevronRight size={18} />
              </button>
            ) : (
              <button
                type="submit"
                className={`submit-btn ${!isStepValid() || loading ? 'disabled' : ''}`}
                onClick={handleSubmit}
                disabled={!isStepValid() || loading}
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="spinning" /> Creating...
                  </>
                ) : 'Create Workbench'}
              </button>
            )}
          </div>
        </form>
      </div>

      <style jsx="true">{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
        }

        .modal-content {
          width: 100%;
          max-width: 700px;
          border-radius: 1.5rem;
          background-color: #0a0a0a;
          border: 1px solid #1a1a1a;
          position: relative;
          display: flex;
          flex-direction: column;
          max-height: 90vh;
          overflow: hidden;
          color: white;
        }

        .close-btn {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          color: #666;
          transition: color 0.2s;
          background: none;
          border: none;
          cursor: pointer;
        }

        .close-btn:hover {
          color: white;
        }

        .modal-header {
          padding: 2.5rem 2.5rem 1.5rem;
          border-bottom: 1px solid #1a1a1a;
        }

        .modal-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 2rem;
          color: white;
        }

        .step-progress {
          display: flex;
          justify-content: space-between;
          position: relative;
        }

        .step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          position: relative;
          flex: 1;
          z-index: 1;
        }

        .step-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: #1a1a1a;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          border: 1px solid #2a2a2a;
          transition: all 0.3s;
        }

        .step-item.active .step-icon {
          background-color: #81E6D9;
          color: #000;
          border-color: #81E6D9;
        }

        .step-item.completed .step-icon {
          background-color: rgba(129, 230, 217, 0.2);
          color: #81E6D9;
          border-color: #81E6D9;
        }

        .step-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: #666;
        }

        .step-item.active .step-title {
          color: white;
        }

        .step-line {
          position: absolute;
          top: 18px;
          left: 50%;
          width: 100%;
          height: 1px;
          background-color: #2a2a2a;
          z-index: -1;
        }

        .step-item.completed .step-line {
          background-color: #81E6D9;
        }

        .modal-body {
          padding: 2.5rem;
          overflow-y: auto;
          background-color: #0a0a0a;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group.span-2 {
          grid-column: span 2;
        }

        .form-group label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #efefef;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .form-group input, .form-group select {
          background-color: #121212;
          border: 1px solid #2a2a2a;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          color: white;
          transition: all 0.2s;
        }

        .form-group input:focus, .form-group select:focus {
          border-color: #81E6D9;
          outline: none;
          background-color: #161616;
        }

        .form-group input::placeholder {
          color: #444;
        }

        .modal-footer {
          padding: 1.5rem 2.5rem 2.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          border-top: 1px solid #1a1a1a;
          background-color: #0a0a0a;
        }

        .spacer {
          flex: 1;
        }

        .next-btn, .submit-btn {
          background-color: #81E6D9;
          color: #000;
          padding: 0.75rem 1.8rem;
          border-radius: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: transform 0.2s;
          border: none;
          cursor: pointer;
        }

        .next-btn.disabled, .submit-btn.disabled {
          background-color: #333;
          color: #666;
          cursor: not-allowed;
          opacity: 0.5;
        }

        .back-btn {
          color: #888;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: color 0.2s;
          background: none;
          border: none;
          cursor: pointer;
        }

        .coa-type-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .coa-option {
          padding: 1.25rem;
          background-color: #121212;
          border: 1px solid #2a2a2a;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .coa-option:hover {
          border-color: #444;
          background-color: #161616;
        }

        .coa-option.active {
          border-color: #81E6D9;
          background-color: rgba(129, 230, 217, 0.05);
          box-shadow: 0 0 15px rgba(129, 230, 217, 0.1);
        }

        .option-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background-color: #1a1a1a;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #888;
        }

        .coa-option.active .option-icon {
          background-color: rgba(129, 230, 217, 0.2);
          color: #81E6D9;
        }

        .option-info {
          display: flex;
          flex-direction: column;
        }

        .option-info strong {
          font-size: 0.9rem;
          color: white;
        }

        .option-info span {
          font-size: 0.75rem;
          color: #666;
        }
        
        .error-notice {
          padding: 0.75rem 1rem;
          background-color: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 0.75rem;
          color: #ef4444;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinning {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default CreateWorkbenchModal;
