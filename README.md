# BNI Lakshya AI Banner Studio

An AI-powered banner generation platform built for **BNI Lakshya** to help members and administrators create professional, brand-consistent marketing banners in seconds.

## Features

### Member Features

* Generate banners using AI-powered content generation
* Multiple banner categories:

  * Visitor Invite
  * Weekly Meeting
  * Speaker Feature
* Real-time banner preview
* Edit generated content before finalizing
* Download banners in high quality
* Secure Firebase Authentication

### Admin Features

* Manage all generated banners
* View banners created by members
* Customize chapter branding and settings
* Monitor banner generation activity
* Manage application configuration

### AI Integration

* Gemini API integration for intelligent banner copy generation
* Dynamic content creation based on user inputs
* Professional business networking focused messaging

## Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript (Vanilla JS)

### Backend

* Node.js
* Express.js

### Database & Authentication

* Firebase Authentication
* Firestore Database
* Firebase Admin SDK

### AI Services

* Google Gemini API

## Project Structure

```text
BNI-Lakshya-AI-Banner-Studio/
│
├── public/
│   ├── css/
│   ├── js/
│   └── index.html
│
├── src/
│   └── firebase.js
│
├── server.js
├── firebase.js
├── package.json
├── .gitignore
└── README.md
```

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/OmMamtora/BNI-Lakshya-AI-Banner-Studio.git
cd BNI-Lakshya-AI-Banner-Studio
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

Create a `.env` file in the project root.

```env
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
```

### 4. Configure Firebase

Add your Firebase configuration in:

```text
src/firebase.js
```

Place your Firebase Admin Service Account JSON locally and do not commit it to GitHub.

### 5. Start Application

```bash
npm start
```

Application will run at:

```text
http://localhost:3000
```

## Available Scripts

### Start Server

```bash
npm start
```

### Development Mode

```bash
npm run dev
```

## Security

The following files should never be committed:

```text
.env
firebase-service-account.json
```

Ensure they are included in `.gitignore`.
