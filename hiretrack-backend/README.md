# HireTrack Backend — AI-Powered Job Application Tracker API

Backend API for HireTrack built with Node.js, Express, and MongoDB.

## 🚀 Features

- 🔐 JWT Auth + Google OAuth 2.0
- 📄 AI Resume Parser (PDF → Gemini AI)
- 🔍 Multi-source Job Feed with match scoring
- 📊 6-stage Kanban Pipeline tracker
- ⚖️ Offer Comparison tool
- 📧 Smart Email Notifications
- 📜 Activity Audit Log

## 🛠️ Tech Stack

Node.js | Express | MongoDB | JWT | Google OAuth | Gemini AI | JSearch API | Nodemailer | node-cron

## 📦 Quick Start

```bash
# Clone and install
git clone https://github.com/your-username/hiretrack-backend.git
cd hiretrack-backend
npm install

# Setup environment
cp .env.example .env
# Fill in your API keys and secrets

# Start server
npm run dev
```

Server runs at `http://localhost:5000`

## 🔑 Environment Variables

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
GEMINI_API_KEY=your_gemini_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=http://localhost:5173
RAPIDAPI_KEY=your_rapidapi_key
RAPIDAPI_HOST=jsearch.p.rapidapi.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

## 📡 API Endpoints

### Auth (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /logout` - Logout (requires auth)
- `POST /refresh` - Refresh token
- `GET /me` - Get current user (requires auth)
- `GET /google` - Google OAuth login

### Resume (`/api/resume`)
- `POST /upload` - Upload & parse resume PDF
- `GET /` - Get user's resume
- `PATCH /:id` - Update resume
- `DELETE /:id` - Delete resume

### Jobs (`/api/jobs`)
- `GET /feed` - Get personalized job feed with match scores

### Applications (`/api/applications`)
- `POST /` - Create application
- `GET /` - Get all user applications
- `GET /check/:jobId` - Check if job already applied
- `PATCH /:id` - Update application
- `DELETE /:id` - Delete application
- `PATCH /:id/status` - Update application status
- `POST /:id/interviews` - Add interview

### Offers (`/api/offers`)
- `POST /` - Create offer
- `GET /` - Get all offers
- `PATCH /:id` - Update offer
- `DELETE /:id` - Delete offer
- `POST /compare` - Compare multiple offers

### Activity (`/api/activity`)
- `GET /` - Get user activity log

## 📁 Project Structure
hiretrack-backend/
│
├── config/
│   ├── db.js                    # MongoDB connection
│   └── passport.js              # Google OAuth strategy
│
├── controllers/
│   ├── authController.js        # Authentication logic
│   ├── resumeController.js      # Resume upload & parsing
│   ├── jobController.js         # Job feed & matching
│   ├── applicationController.js # Application CRUD
│   ├── offerController.js       # Offer management
│   └── activityController.js    # Activity logging
│
├── middleware/
│   ├── auth.js                  # JWT protection & authorization
│   └── upload.js                # Multer file upload config
│
├── models/
│   ├── User.js                  # User schema
│   ├── Resume.js                # Resume schema
│   ├── Job.js                   # Job schema
│   ├── Application.js           # Application schema
│   ├── Offer.js                 # Offer schema
│   └── Activity.js              # Activity log schema
│
├── routes/
│   ├── authRoutes.js            # Auth endpoints
│   ├── resumeRoutes.js          # Resume endpoints
│   ├── jobRoutes.js             # Job endpoints
│   ├── applicationRoutes.js     # Application endpoints
│   ├── offerRoutes.js           # Offer endpoints
│   └── activityRoutes.js        # Activity endpoints
│
├── services/
│   ├── aiService.js             # Gemini AI integration
│   ├── jobService.js            # JSearch API & normalization
│   ├── matchService.js          # Fuzzy skill matching
│   └── emailService.js          # Email templates & sending
│
├── utils/
│   ├── pdfParser.js             # PDF text extraction
│   └── cronJobs.js              # Scheduled notifications
│
├── uploads/                     # Temporary file storage
│
├── .env                         # Environment variables (git-ignored)
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies & scripts
├── package-lock.json            # Locked dependency versions
├── README.md                    # Project documentation
└── server.js                    # Application entry point


## 🧪 Scripts

```bash
npm run dev      # Development with hot-reload (nodemon)
npm start        # Production server
```

## 🚢 Deployment

1. Set `NODE_ENV=production`
2. Update `FRONTEND_URL` to deployed frontend URL
3. Add all environment variables to hosting platform
4. Deploy to Render/Railway/Heroku

---

**Built by Soumya Shri** — B.Tech CSE, Batch 2023‑2027, Dronacharya College of Engineering




