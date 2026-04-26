# MedIntel - AI-Powered Healthcare Platform

MedIntel is a production-style, modern, and containerized MERN stack application tailored for clinics, hospitals, and diagnostic centers. It features a premium UI, JWT authentication, and mock AI health insights.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Recharts
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT
- **DevOps**: Docker, Docker Compose

## Prerequisites
- Docker & Docker Compose installed on your machine.

## Setup Instructions

### 1. Running Locally with Docker
This project is fully dockerized. To spin up the database, backend, and frontend simultaneously, simply run:

```bash
cd medintel
docker-compose up --build
```

### 2. Accessing the Application
Once the containers are running:
- **Frontend Dashboard**: Navigate to [http://localhost:5173](http://localhost:5173) in your browser.
- **Backend API**: Accessible at `http://localhost:5000`

### 3. Verification Commands for Assignment
To verify the containers are running and generate screenshots for your assignment, open a new terminal window and run:

```bash
docker ps
```
This command will list all running MedIntel containers (`medintel_frontend`, `medintel_backend`, `medintel_mongodb`).

## Application Features
- **Modern Authentication**: Secure Login/Signup with JWT.
- **Interactive Dashboard**: View key metrics and interactive charts using Recharts.
- **Patient & Appointment Management**: Full APIs prepared for robust healthcare operations.
- **AI Health Insights (Mock)**: Get AI-generated risk alerts directly on the dashboard.

## Folder Structure
- `/frontend`: Vite React App with modern styling.
- `/backend`: Node.js Express server with Mongoose schemas and MVC architecture.
- `docker-compose.yml`: Orchestrates the microservices.
