import { useState } from 'react'
import Logo from './Logo'
import VerificationPage from './VerificationPage'
import './LoginPage.css'

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [role, setRole] = useState('user')
  const [adminCode, setAdminCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [pendingVerification, setPendingVerification] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (isRegistering) {
        // Register
        if (!email || !password || !username || !role) {
          setError('All fields are required')
          setIsLoading(false)
          return
        }

        if (!email.endsWith('@gmail.com')) {
          setError('You must use a Gmail account (email must end with @gmail.com)')
          setIsLoading(false)
          return
        }

        if (role === 'admin' && !adminCode) {
          setError('Admin code is required for admin account')
          setIsLoading(false)
          return
        }

        if (role === 'admin' && adminCode !== '122601') {
          setError('Invalid admin code')
          setIsLoading(false)
          return
        }

        if (password.length < 6) {
          setError('Password must be at least 6 characters')
          setIsLoading(false)
          return
        }

        // Call backend register
        const response = await fetch('http://localhost:5000/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, username, role, adminCode })
        })

        if (!response.ok) {
          const data = await response.json()
          setError(data.error || 'Registration failed')
          setIsLoading(false)
          return
        }

        // Show verification page
        setRegisteredEmail(email)
        setPendingVerification(true)
        setIsLoading(false)
        return
      } else {
        // Login
        if (!email || !password) {
          setError('Email and password are required')
          setIsLoading(false)
          return
        }

        // Call backend login
        const response = await fetch('http://localhost:5000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })

        if (!response.ok) {
          const data = await response.json()
          setError(data.error || 'Login failed')
          setIsLoading(false)
          return
        }

        const data = await response.json()
        setIsLoading(false)
        onLogin(data.user)
      }
    } catch (err) {
      setError('Error: ' + err.message)
      setIsLoading(false)
    }
  }

  return (
    <>
      {pendingVerification ? (
        <VerificationPage 
          email={registeredEmail}
          onVerificationComplete={() => {
            setPendingVerification(false)
            setIsRegistering(false)
            setEmail('')
            setPassword('')
            setUsername('')
            setAdminCode('')
            setRegisteredEmail('')
            setError('Account verified! Please login.')
          }}
          onBackToRegister={() => {
            setPendingVerification(false)
            setEmail(registeredEmail)
            setIsRegistering(true)
          }}
        />
      ) : (
        <div className="login-container">
          <div className="login-box">
            <Logo />
            <h1>{isRegistering ? 'Register' : 'Login'}</h1>
            <form onSubmit={handleSubmit}>
              {isRegistering && (
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    disabled={isLoading}
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
              </div>

              {isRegistering && (
                <div className="form-group">
                  <label htmlFor="role">Account Type</label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={isLoading}
                    className="role-select"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              )}

              {isRegistering && role === 'admin' && (
                <div className="form-group">
                  <label htmlFor="adminCode">Admin Code</label>
                  <input
                    id="adminCode"
                    type="password"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    placeholder="Enter admin code"
                    disabled={isLoading}
                  />
                </div>
              )}

              {error && (
                <div className={`message ${isRegistering && !error.includes('successful') ? 'error-message' : error.includes('successful') ? 'success-message' : 'error-message'}`}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={isLoading} className="login-button">
                {isLoading ? 'Processing...' : isRegistering ? 'Create Account' : 'Login'}
              </button>
            </form>

            <div className="footer">
              <button
                type="button"
                className="toggle-btn"
                onClick={() => {
                  setIsRegistering(!isRegistering)
                  setError('')
                  setPassword('')
                  setAdminCode('')
                }}
                disabled={isLoading}
              >
                {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
