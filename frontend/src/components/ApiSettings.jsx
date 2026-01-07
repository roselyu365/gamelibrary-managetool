import React, { useState, useEffect } from 'react'
import axios from 'axios'

const ApiSettings = ({ onClose, onApiUrlChange }) => {
  const [apiUrl, setApiUrl] = useState('')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  useEffect(() => {
    // Load saved API URL from localStorage or use env var or default
    const defaultUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    const savedApiUrl = localStorage.getItem('backendApiUrl') || defaultUrl
    setApiUrl(savedApiUrl)
  }, [])

  const handleSave = () => {
    localStorage.setItem('backendApiUrl', apiUrl)
    onApiUrlChange(apiUrl)
    onClose()
  }

  const testConnection = async () => {
    setTesting(true)
    setTestResult(null)

    try {
      const response = await axios.get(`${apiUrl}/api/health`, { timeout: 5000 })
      setTestResult({
        success: true,
        message: 'Connection successful!'
      })
    } catch (error) {
      setTestResult({
        success: false,
        message: error.response?.data?.error || 'Failed to connect to API'
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚙️ API Settings</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="apiUrl">Backend API URL</label>
            <input
              id="apiUrl"
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://localhost:8000"
            />
            <small className="form-help">
              Enter the URL where your backend API is running. This will be saved to your browser's local storage.
            </small>
          </div>

          <button
            type="button"
            onClick={testConnection}
            disabled={testing}
            className="button-secondary"
            style={{marginTop: '0.5rem'}}
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </button>

          {testResult && (
            <div className={`alert ${testResult.success ? 'alert-success' : 'alert-error'}`} style={{marginTop: '0.5rem'}}>
              {testResult.message}
            </div>
          )}

          <div style={{marginTop: '1.5rem'}}>
            <p><strong>Current Configuration:</strong></p>
            <ul>
              <li>API URL: <code>{apiUrl}</code></li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="button-secondary">
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="button-primary">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}

export default ApiSettings
