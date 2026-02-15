import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'

let db
let usersCollection
let pendingUsersCollection

// Setup Gmail transporter for email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD
  }
})

// Generate random confirmation code
function generateConfirmationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Middleware
app.use(express.json())
app.use(cors())

// Connect to MongoDB
async function connectDB() {
  try {
    const client = new MongoClient(MONGODB_URI, { 
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000 
    })
    await client.connect()
    console.log('✓ Connected to MongoDB')
    db = client.db('login_app')
    usersCollection = db.collection('users')
    pendingUsersCollection = db.collection('pending_users')
  } catch (error) {
    console.warn('⚠ MongoDB connection failed:', error.message)
    console.warn('⚠ Running in offline mode - database features disabled')
    console.warn('⚠ Please check your MongoDB connection string and network access')
  }
}

// Register user
app.post('/api/register', async (req, res) => {
  try {
    if (!usersCollection || !pendingUsersCollection) {
      return res.status(503).json({ error: 'Database not connected' })
    }
    
    const { email, password, username, role, adminCode } = req.body

    if (!email || !password || !username || !role) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    // Validate Gmail domain
    if (!email.endsWith('@gmail.com')) {
      return res.status(400).json({ error: 'You must use a Gmail account (email must end with @gmail.com)' })
    }

    // Validate role
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ error: 'Role must be "user" or "admin"' })
    }

    // Validate admin code if admin role
    if (role === 'admin') {
      if (!adminCode) {
        return res.status(400).json({ error: 'Admin code is required' })
      }
      if (adminCode !== '122601') {
        return res.status(400).json({ error: 'Invalid admin code' })
      }
    }

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }

    // Generate confirmation code
    const confirmationCode = generateConfirmationCode()
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Store pending user registration
    await pendingUsersCollection.insertOne({
      email,
      username,
      password: hashedPassword,
      role,
      confirmationCode,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    })

    // Send confirmation email
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Email Confirmation - Dasia Security Training Academy',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Welcome to Dasia Security Training Academy!</h2>
          <p>Hi ${username},</p>
          <p>Thank you for registering. Please use the confirmation code below to verify your email address:</p>
          <div style="background-color: #f0f0f0; padding: 15px; margin: 20px 0; border-radius: 5px; text-align: center;">
            <h3 style="margin: 0; color: #667eea;">${confirmationCode}</h3>
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't create this account, you can ignore this email.</p>
          <p>Best regards,<br/>Dasia Security Training Academy Team</p>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)

    res.status(201).json({
      message: 'Registration successful! Please check your email for the confirmation code.',
      email: email,
      requiresVerification: true
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Verify email confirmation code
app.post('/api/verify-email', async (req, res) => {
  try {
    if (!usersCollection || !pendingUsersCollection) {
      return res.status(503).json({ error: 'Database not connected' })
    }

    const { email, confirmationCode } = req.body

    if (!email || !confirmationCode) {
      return res.status(400).json({ error: 'Email and confirmation code are required' })
    }

    // Find pending user
    const pendingUser = await pendingUsersCollection.findOne({ email })
    if (!pendingUser) {
      return res.status(400).json({ error: 'Registration not found. Please register again.' })
    }

    // Check if code is expired
    if (new Date() > pendingUser.expiresAt) {
      await pendingUsersCollection.deleteOne({ email })
      return res.status(400).json({ error: 'Confirmation code has expired. Please register again.' })
    }

    // Verify confirmation code
    if (pendingUser.confirmationCode !== confirmationCode) {
      return res.status(400).json({ error: 'Invalid confirmation code' })
    }

    // Create user in main collection
    const result = await usersCollection.insertOne({
      email: pendingUser.email,
      username: pendingUser.username,
      password: pendingUser.password,
      role: pendingUser.role,
      verified: true,
      createdAt: new Date()
    })

    // Delete from pending collection
    await pendingUsersCollection.deleteOne({ email })

    res.json({
      message: 'Email verified successfully. You can now login.',
      userId: result.insertedId
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Login user
app.post('/api/login', async (req, res) => {
  try {
    if (!usersCollection) {
      return res.status(503).json({ error: 'Database not connected' })
    }
    
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Find user
    const user = await usersCollection.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get user profile
app.get('/api/user/:id', async (req, res) => {
  try {
    const { ObjectId } = await import('mongodb')
    const user = await usersCollection.findOne({ _id: new ObjectId(req.params.id) })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get all users (Admin only)
app.get('/api/users', async (req, res) => {
  try {
    if (!usersCollection) {
      return res.status(503).json({ error: 'Database not connected' })
    }

    const users = await usersCollection
      .find({}, { projection: { password: 0 } })
      .toArray()

    res.json({
      total: users.length,
      users: users.map(user => ({
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt
      }))
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' })
})

// Connect to DB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    if (db) {
      console.log(`✓ Server running on http://localhost:${PORT} (Database connected)`)
    } else {
      console.log(`✓ Server running on http://localhost:${PORT} (Offline mode)`)
    }
  })
})
