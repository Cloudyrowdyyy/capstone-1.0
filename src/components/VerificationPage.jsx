import { useState } from 'react'
import Logo from './Logo'
import './VerificationPage.css'

export default function VerificationPage({ email, onVerificationComplete, onBackToRegister }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit code')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, confirmationCode: code })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Verification failed')
        setIsLoading(false)
        return
      }

      setSuccess('Email verified successfully! Redirecting to login...')
      setIsLoading(false)
      
      setTimeout(() => {
        onVerificationComplete()
      }, 2000)
    } catch (err) {
      setError('Error: ' + err.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="verification-container">
      <div className="verification-box">
        <Logo />
        <h1>Verify Your Email</h1>
        <p className="verification-email">
          A confirmation code has been sent to <strong>{email}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="code">Confirmation Code</label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              disabled={isLoading}
              maxLength="6"
              inputMode="numeric"
              className="code-input"
            />
            <p className="code-hint">Check your email (including spam folder)</p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button type="submit" disabled={isLoading} className="verify-button">
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="verification-footer">
          <p>Didn't receive the code?</p>
          <button
            type="button"
            className="resend-btn"
            onClick={onBackToRegister}
            disabled={isLoading}
          >
            Go Back to Register
          </button>
        </div>
      </div>
    </div>
  )
}
