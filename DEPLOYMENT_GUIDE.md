# Guard Firearm Management System - Web Deployment Guide

## 📋 Project Structure (Web-Based Only)

This is a **pure web application** - NOT a desktop app. It consists of:

### Frontend
- **React** application (Vite)
- Port: `5173` (local dev) or production domain
- Path: `/src` directory
- Builds to: `/dist` directory

### Backend
- **Express.js** REST API
- Port: `5000` (local dev) or configured port
- MongoDB database integration
- Path: `/backend/server.js`

---

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- npm 9+
- MongoDB (local or cloud)

### Setup

```bash
# Install dependencies
npm install

# Start backend server (in new terminal)
node backend/server.js

# Start frontend dev server (in main terminal)
npm run dev
```

**Access the app:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## 🌐 Production Deployment Options

### Option 1: AWS Deployment (Recommended)

#### Using EC2 + PM2

```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Clone repository
git clone <your-repo-url>
cd guard-firearm-management

# Install dependencies
npm install

# Build frontend
npm run build

# Install PM2 globally
npm install -g pm2

# Create PM2 ecosystem file (save as ecosystem.config.js)
```

ecosystem.config.js:
```javascript
module.exports = {
  apps: [
    {
      name: 'firearm-backend',
      script: 'backend/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      port: 5000,
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        MONGODB_URI: 'your-mongodb-connection-string'
      }
    }
  ]
};
```

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Setup auto-restart
pm2 startup
pm2 save
```

#### Using AWS Amplify (Easiest)

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Deploy
amplify publish
```

---

### Option 2: DigitalOcean App Platform

1. **Connect GitHub repository** to DigitalOcean
2. **Configure**:
   - Frontend Service: `npm run build` → serves `/dist`
   - Backend Service: `node backend/server.js` → port 5000
3. **Deploy** - DigitalOcean handles the rest

---

### Option 3: Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Add MongoDB addon
heroku addons:create mongolab

# Deploy
git push heroku main
```

Create `Procfile`:
```
web: node backend/server.js
```

---

## 🔧 Environment Variables

Create `.env` file (backend):

```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname

# API
CORS_ORIGIN=https://your-domain.com

# Security
JWT_SECRET=your-secret-key
```

---

## 📦 Build for Production

```bash
# Build React frontend
npm run build

# Output: dist/ folder (ready for static hosting)

# Backend runs separately on its own port
node backend/server.js
```

---

## 🔐 Security Checklist

- ✅ Use HTTPS in production
- ✅ Set secure MongoDB connection string
- ✅ Enable CORS only for your domain
- ✅ Use environment variables for secrets
- ✅ Set NODE_ENV=production
- ✅ Configure firewall rules
- ✅ Enable database backups
- ✅ Use strong JWT secrets

---

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Kill process on port 5000
# Windows:
taskkill /F /IM node.exe

# Linux/Mac:
lsof -ti:5000 | xargs kill -9
```

**MongoDB connection error:**
- Verify connection string in `.env`
- Check MongoDB is running
- Ensure IP whitelist includes deployment server

**CORS errors:**
- Check `CORS_ORIGIN` in backend
- Verify frontend domain matches

---

## 📚 API Documentation

Backend runs on `/api` endpoints:
- `GET /api/users` - List all users
- `GET /api/firearms` - List firearms inventory
- `POST /api/alerts` - Create alert
- `GET /api/alerts` - Get all alerts
- And many more...

See [backend/server.js](backend/server.js) for complete API reference.

---

## 🎯 Next Steps

1. ✅ Set up MongoDB Atlas (free tier available)
2. ✅ Create AWS EC2 instance or DigitalOcean droplet
3. ✅ Deploy backend first, test API
4. ✅ Deploy frontend pointing to backend API
5. ✅ Configure custom domain and SSL
6. ✅ Set up monitoring and logging

---

## 📞 Support

For issues or questions:
1. Check server logs: `pm2 logs`
2. Verify backend is running on port 5000
3. Check MongoDB connection
4. Review environment variables
