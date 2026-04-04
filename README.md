# BuddyScript Backend API

A high-performance, professional, and secure REST API built for the **BuddyScript** social networking platform.

## 🚀 Features

- **Authentication & Authorization**: Secure JWT-based authentication with cookie-based storage.
- **Post Management**: CRUD operations for social posts.
- **Social Interactions**: Support for likes, comments, and follows (built-in models).
- **Security**: 
  - Helmet for security headers.
  - Rate limiting to prevent brute-force attacks.
  - CORS configuration.
  - Body size limits.
  - Data sanitization.
- **Interactive API Documentation**: Dedicated API explorer available at `/api-docs`.
- **Health Monitoring**: Endpoint to check server status at `/api/health`.
- **Performance**: Response compression and optimized database queries via Mongoose.

## 🛠️ Technology Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose ODM](https://mongoosejs.com/)
- **Validation**: [Zod](https://zod.dev/)
- **Authentication**: [JSON Web Tokens (JWT)](https://jwt.io/) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Logging**: [Morgan](https://github.com/expressjs/morgan) & [Winston](https://github.com/winstonjs/winston)

## 📋 Prerequisites

- Node.js (v18+)
- npm or yarn
- MongoDB Atlas account or local MongoDB instance

## ⚙️ Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd buddyscript_backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory and add the following variables:
   ```env
   PORT=5001
   NODE_ENV=development
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CORS_ORIGIN=http://localhost:3000
   ```

## 🏃 Running the Application

### Development Mode (with Nodemon)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## 📖 API Documentation

The API comes with an interactive explorer. Once the server is running, visit:
- `http://localhost:5001/api-docs`

## 🩺 Health Check

Monitor server status:
- `GET http://localhost:5001/api/health`

## 📁 Project Structure

- `src/app.js`: Application setup and middleware integration.
- `src/server.js`: Entry point and database connection logic.
- `src/controllers/`: Route handlers and business logic.
- `src/models/`: Mongoose schemas (User, Post, Follow, etc.).
- `src/routes/`: API endpoint definitions.
- `src/middleware/`: Custom middleware (Auth, Error handling).
- `src/docs/`: API Explorer and documentation assets.

---
Built with ❤️ for BuddyScript.
