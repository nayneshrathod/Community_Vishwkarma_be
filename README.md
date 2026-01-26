# Vishwakarma Community Portal - Backend

High-performance API service supporting the Vishwakarma Community Portal, built with Node.js, Express, and MongoDB.

## 🚀 Overview

The backend service manages all data operations, authentication, and notification logic for the community portal. It provides a RESTful API designed for reliability and security.

## ✨ Key Features

- **🔐 Authentication**: Robust JWT-based authentication system.
- **📁 Member Management**: Comprehensive CRUD operations for community members with family relationship tracking.
- **📜 Notification System**: Real-time notifications for user approvals, events, and notices.
- **💰 Fund Tracking**: Secure API endpoints for managing community donations and financial stats.
- **📸 File Uploads**: Integrated image handling for member photos and notice attachments.
- **⚙️ Admin Tools**: Utility scripts for environment seeding, database checks, and performance testing.

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **CORS & Security**: Helmet, CORS, and JSON Web Tokens.

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/) (Local instance or Atlas connection string)

### Installation

1.  Clone the repository and navigate to the project folder.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables in a `.env` file:
    ```env
    PORT=3000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    ```
4.  Start the server:
    ```bash
    npm start
    ```

## 📂 Utility Scripts

The repository includes several helpful scripts:

- `seed_admin.js`: Quickly initialize the database with a superadmin account.
- `check-member.js`: Validate member data and integrity.
- `test-performance.js`: Performance benchmarking for API endpoints.

## 🤝 Support

For technical support or API integration queries, contact the system administrator.

---

© 2026 Vishwakarma Community Portal. All rights reserved.
