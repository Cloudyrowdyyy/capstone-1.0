# 🔫 Guard Firearm Management System

## What is This?

A **complete web application** for managing guard firearm inventory, allocations, permits, and maintenance.

### 🎯 NOT A Desktop App
- Pure web-based
- React frontend + Express backend
- Can be deployed anywhere (AWS, DigitalOcean, Heroku, etc.)
- Access via web browser

### ✨ Key Features

#### 🔔 **Real-Time Alerts System**
- Automatic permit expiry notifications (30-day window)
- Maintenance due alerts (60+ days overdue)
- Low stock alerts (≤3 units)
- Priority-based notifications (low, medium, high, critical)
- Auto-refresh every 30 seconds

#### 📊 **Reports & Analytics**
- Firearm Audit Reports (complete inventory)
- Allocation History (track all deployments)
- Permit Expiry Reports (renewal status)
- Maintenance Records (service history)
- Export to CSV, JSON, or PDF

#### 👮 **Guard Dashboard**
- View currently allocated firearms
- Track permit expiration dates
- Request permit renewals
- View allocation history
- Return records tracking

#### 👤 **User Management**
- Role-based access control (Superadmin, Guard)
- User registration and verification
- Profile management
- License tracking

#### 🔫 **Firearm Inventory**
- Complete inventory management
- Serial number tracking
- Condition monitoring
- Location tracking
- Maintenance scheduling

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- MongoDB (local or MongoDB Atlas)

### Installation

```bash
# Clone repository
git clone <your-repo>
cd guard-firearm-management

# Install dependencies
npm install

# Start in two terminals:

# Terminal 1: Backend Server
node backend/server.js

# Terminal 2: Frontend Dev Server
npm run dev
```

### Access the App

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

---

## 🌍 Deployment

### Quick Deploy to AWS
```bash
# See DEPLOYMENT_GUIDE.md for detailed instructions
# Basic steps:
# 1. Create EC2 instance
# 2. Clone repository
# 3. Set up MongoDB Atlas
# 4. Run backend with PM2
# 5. Deploy frontend to S3/CloudFront (or serve from same server)
```

### Other Options
- **DigitalOcean App Platform** - Easiest, automatic deployment
- **Heroku** - Quick deploy with Procfile
- **Vercel** (frontend only) + separate backend hosting
- **Self-hosted** VPS with nginx reverse proxy

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for complete instructions.

---

## 📁 Project Structure

```
guard-firearm-management/
├── backend/
│   ├── server.js              # Express API server
│   └── package.json           # Backend dependencies
├── src/
│   ├── components/            # React components
│   ├── App.jsx               # Main app
│   └── main.jsx              # Entry point
├── public/                    # Static assets
├── dist/                      # Built frontend (production)
├── package.json               # Frontend dependencies
├── vite.config.js            # Vite configuration
└── index.html                # Main HTML file
```

---

## 🔧 Technology Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool (fast development)
- **JavaScript/CSS** - Core languages

### Backend
- **Express.js** - REST API framework
- **MongoDB** - NoSQL database
- **Node.js** - Runtime

### Deployment
- **AWS EC2** / **DigitalOcean** / **Heroku**
- **MongoDB Atlas** - Managed database
- **nginx** - Reverse proxy (optional)

---

## 🎮 Usage

### Admin Dashboard
1. Login as superadmin
2. View all users and manage roles
3. Check real-time alerts and notifications
4. Generate custom reports
5. Monitor firearm inventory

### Guard Portal
1. Login with guard credentials
2. View allocated firearms
3. Check permit expiry dates
4. Request permit renewals
5. Review allocation history

---

## 🔐 Security Features

- Role-based access control (RBAC)
- Password hashing
- CORS protection
- Environment variables for secrets
- MongoDB connection validation
- Input sanitization

---

## 📊 API Endpoints

All API endpoints on `http://localhost:5000/api/`

### Users
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Firearms
- `GET /api/firearms` - List inventory
- `POST /api/firearms` - Add firearm
- `PUT /api/firearms/:id` - Update firearm
- `DELETE /api/firearms/:id` - Remove firearm

### Alerts
- `GET /api/alerts` - Get all alerts
- `POST /api/alerts` - Create alert
- `PATCH /api/alerts/:id/read` - Mark as read
- `DELETE /api/alerts/:id` - Delete alert
- `POST /api/alerts/generate/permits-expiring` - Auto-generate
- `POST /api/alerts/generate/maintenance-due` - Auto-generate
- `POST /api/alerts/generate/low-stock` - Auto-generate

### Reports
- `GET /api/firearm-allocations` - Allocation history
- `GET /api/guard-firearm-permits` - Permit data
- `GET /api/firearm-maintenance` - Maintenance records

See `backend/server.js` for complete API documentation.

---

## ⌨️ Keyboard Shortcuts

- `Ctrl+Alt+N` - Toggle Notifications
- `Ctrl+Shift+R` - Open Reports
- `?` - Show Keyboard Help

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows
taskkill /F /IM node.exe

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### MongoDB Connection Error
- Verify connection string in environment
- Check MongoDB is running (local) or online (Atlas)
- Ensure whitelist includes your IP (for Atlas)

### Frontend Won't Load
- Check backend is running on port 5000
- Clear browser cache
- Check browser console for errors
- Verify CORS configuration

---

## 📝 Environment Setup

Create `.env` file in backend directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/firearm_management

# Or for MongoDB Atlas:
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname

# CORS
CORS_ORIGIN=http://localhost:5173
```

---

## 🚢 Production Checklist

- ✅ MongoDB Atlas or production database setup
- ✅ Environment variables configured
- ✅ Frontend built with `npm run build`
- ✅ Backend running with PM2 or similar
- ✅ Domain configured
- ✅ SSL certificate installed
- ✅ Backups enabled
- ✅ Monitoring and logging setup

---

## 📞 Support & Documentation

- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Full deployment instructions
- [API Documentation](backend/server.js) - Complete API reference
- Terminal logs - Run `pm2 logs` for production logs

---

## 📄 License

All rights reserved.

---

## 🎯 This is a WEB APP

Remember: This is a **web application**, not a desktop app. It runs in:
- Chrome, Firefox, Safari, Edge (modern browsers)
- On any device connected to the internet
- On Windows, Mac, Linux, iOS, Android

No installation needed - just visit the URL!
