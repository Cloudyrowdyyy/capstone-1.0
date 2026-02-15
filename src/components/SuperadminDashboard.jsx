import { useState, useEffect } from 'react'
import Logo from './Logo'
import './SuperadminDashboard.css'

export default function SuperadminDashboard({ user, onLogout }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [editFormData, setEditFormData] = useState({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/api/users')
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      const data = await response.json()
      setUsers(data.users)
      setError('')
    } catch (err) {
      setError('Error loading users: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.phoneNumber?.includes(searchTerm)
    const matchesRole = filterRole === 'all' || u.role === filterRole
    return matchesSearch && matchesRole
  })

  const handleEditClick = (u) => {
    setEditingUser(u.id)
    setEditFormData({
      fullName: u.fullName || '',
      phoneNumber: u.phoneNumber || '',
      licenseNumber: u.licenseNumber || '',
      licenseExpiryDate: u.licenseExpiryDate ? u.licenseExpiryDate.split('T')[0] : ''
    })
  }

  const handleEditSave = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${editingUser}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      })

      if (!response.ok) {
        throw new Error('Failed to update user')
      }

      setEditingUser(null)
      setError('')
      fetchUsers()
    } catch (err) {
      setError('Error updating user: ' + err.message)
    }
  }

  const handleDeleteConfirm = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete user')
      }

      setShowDeleteConfirm(null)
      setError('')
      fetchUsers()
    } catch (err) {
      setError('Error deleting user: ' + err.message)
    }
  }

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    users: users.filter(u => u.role === 'user').length,
    verified: users.filter(u => u.verified).length,
    unverified: users.filter(u => !u.verified).length
  }

  return (
    <div className="superadmin-container">
      <div className="superadmin-header">
        <div className="header-left">
          <Logo />
          <div className="header-titles">
            <h1>Superadmin Dashboard</h1>
            <p className="subtitle">Full System Management</p>
          </div>
        </div>
        <div className="header-info">
          <div className="user-info">
            <span className="user-name">{user.username}</span>
            <span className="superadmin-badge">SUPERADMIN</span>
          </div>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="superadmin-content">
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>Total Users</h3>
              <p className="stat-number">{stats.total}</p>
            </div>
          </div>
          <div className="stat-card admins">
            <div className="stat-icon">👨‍💼</div>
            <div className="stat-info">
              <h3>Admins</h3>
              <p className="stat-number">{stats.admins}</p>
            </div>
          </div>
          <div className="stat-card guards">
            <div className="stat-icon">👮</div>
            <div className="stat-info">
              <h3>Guards</h3>
              <p className="stat-number">{stats.users}</p>
            </div>
          </div>
          <div className="stat-card verified">
            <div className="stat-icon">✓</div>
            <div className="stat-info">
              <h3>Verified</h3>
              <p className="stat-number">{stats.verified}</p>
            </div>
          </div>
          <div className="stat-card unverified">
            <div className="stat-icon">⚠</div>
            <div className="stat-info">
              <h3>Unverified</h3>
              <p className="stat-number">{stats.unverified}</p>
            </div>
          </div>
        </div>

        <div className="users-management">
          <div className="management-header">
            <div className="header-title">
              <h2>User Management</h2>
              <span className="user-count">({filteredUsers.length} results)</span>
            </div>
            <button onClick={fetchUsers} className="refresh-btn" disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          <div className="controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-box">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Roles</option>
                <option value="superadmin">Superadmin</option>
                <option value="admin">Admin</option>
                <option value="user">Security Guard</option>
              </select>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty">No users found</div>
          ) : (
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>License</th>
                    <th>Expiry</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className={`user-row role-${u.role}`}>
                      <td>
                        {editingUser === u.id ? (
                          <input 
                            type="text" 
                            value={editFormData.fullName} 
                            onChange={(e) => setEditFormData({...editFormData, fullName: e.target.value})} 
                          />
                        ) : (
                          u.fullName || '-'
                        )}
                      </td>
                      <td>{u.email}</td>
                      <td>
                        {editingUser === u.id ? (
                          <input 
                            type="tel" 
                            value={editFormData.phoneNumber} 
                            onChange={(e) => setEditFormData({...editFormData, phoneNumber: e.target.value})} 
                          />
                        ) : (
                          u.phoneNumber || '-'
                        )}
                      </td>
                      <td>
                        {editingUser === u.id ? (
                          <input 
                            type="text" 
                            value={editFormData.licenseNumber} 
                            onChange={(e) => setEditFormData({...editFormData, licenseNumber: e.target.value})} 
                          />
                        ) : (
                          u.licenseNumber || '-'
                        )}
                      </td>
                      <td>
                        {editingUser === u.id ? (
                          <input 
                            type="date" 
                            value={editFormData.licenseExpiryDate} 
                            onChange={(e) => setEditFormData({...editFormData, licenseExpiryDate: e.target.value})} 
                          />
                        ) : (
                          u.licenseExpiryDate ? new Date(u.licenseExpiryDate).toLocaleDateString() : '-'
                        )}
                      </td>
                      <td>
                        <span className={`role-badge ${u.role}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${u.verified ? 'verified' : 'unverified'}`}>
                          {u.verified ? '✓ Verified' : '⚠ Unverified'}
                        </span>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        {editingUser === u.id ? (
                          <div className="action-buttons">
                            <button className="btn-save" onClick={handleEditSave}>Save</button>
                            <button className="btn-cancel" onClick={() => setEditingUser(null)}>Cancel</button>
                          </div>
                        ) : (
                          <div className="action-buttons">
                            <button className="btn-edit" onClick={() => handleEditClick(u)}>Edit</button>
                            <button className="btn-delete" onClick={() => setShowDeleteConfirm(u.id)}>Delete</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showDeleteConfirm && (
          <div className="delete-confirm-modal">
            <div className="delete-confirm-box">
              <div className="confirm-icon">⚠️</div>
              <h3>Delete User?</h3>
              <p>This action cannot be undone. All user data will be permanently deleted.</p>
              <div className="confirm-buttons">
                <button className="btn-confirm-delete" onClick={() => handleDeleteConfirm(showDeleteConfirm)}>Delete User</button>
                <button className="btn-confirm-cancel" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
