# 🏥 FedMedAI Frontend

> React-based web dashboard for the Federated Learning Medical Diagnosis System.

[![React](https://img.shields.io/badge/React-18.x-blue?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.x-purple?style=flat-square&logo=vite)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.x-teal?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Pages](#-pages)
- [Project Structure](#-project-structure)
- [Related Repositories](#-related-repositories)

---

## 🔍 Overview

**FedMedAI Frontend** is the web dashboard for the Federated Learning Medical Diagnosis System. It provides an intuitive interface for doctors, hospital administrators, and system administrators to:

- Run AI-powered multi-disease predictions
- Monitor federated learning training progress
- Manage hospitals and patients
- View analytics and model performance
- Export data and generate PDF medical reports

> ⚕️ Built for healthcare professionals with a focus on clarity, speed, and trust.

---

## ✨ Features

### 🔐 Authentication
- JWT-based login and registration
- Role-based navigation (Admin / Hospital Admin)
- Persistent session across page refresh
- Automatic logout on token expiry

### 🏠 Dashboard
- Real-time ML service status
- System statistics (hospitals, patients, predictions)
- Live model accuracy from ML service
- Hospital comparison statistics
- Prediction distribution charts

### 🤖 Multi-Disease Prediction
- Predict 5 diseases simultaneously:
  - Heart Disease ❤️
  - Diabetes 🩸
  - Kidney Disease 🫘
  - Liver Disease 🫁
  - Stroke 🧠
- Auto-fill patient features from records
- AI-powered medical recommendations
- Download PDF report
- Email report from hospital identity (FL-compliant)

### 🏥 Hospital Management
- Card grid layout
- Create / Edit / Deactivate hospitals
- Patient count tracking
- Status badges (ACTIVE/INACTIVE)

### 👥 Patient Management
- Searchable patient table
- Hospital filter
- Add patient with 18 medical features
- Risk timeline per patient

### 📊 Analytics
- Model accuracy charts (Recharts)
- Feature importance visualization
- Prediction distribution
- Hospital comparison

### 🔄 FL Model Training
- Trigger federated learning rounds
- Engine selector: Custom FedAvg / Flower
- Differential Privacy toggle (ε control)
- Before/After accuracy comparison
- Training round history

### ⏰ Scheduler
- Auto training status
- Manual trigger
- Run history
- Schedule presets

### 📤 Export
- Patients CSV download
- Predictions CSV download
- Hospital filter for exports

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | UI Framework |
| Vite | Build Tool |
| React Router | Client-side Routing |
| Tailwind CSS |  Styling |
| Axios | HTTP Client |
| Recharts |  Charts |
| Framer Motion | Animations |
| React Toastify | Notifications |
| React Icons |  Icons |

---

## 📦 Prerequisites

```bash
Node.js 20+
npm 10+

# Backend running on port 8080
# ML Service running on port 8000
```

---

## 🚀 Quick Start

### 1. Clone

```bash
git clone https://github.com/deepakbhat18/FedMedAI-frontend.git
cd FedMedAI-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Open Browser

```
http://localhost:3000
```

### 5. Login

```
Admin:          admin / admin123
Hospital Admin: hospital1_admin / hospital123
```

---

## 📄 Pages

| Route | Page | Access |
|---|---|---|
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/dashboard` | Dashboard | All |
| `/hospitals` | Hospitals | All |
| `/patients` | Patients | All |
| `/predict` | Predict Disease | All |
| `/predictions` | Prediction History | All |
| `/models` | FL Models & Training | All |
| `/analytics` | Analytics | All |
| `/scheduler` | Auto Scheduler | Admin |
| `/export` | Export Data | All |

---

## 📁 Project Structure

```
src/
├── api/
│   ├── axiosConfig.js        ← Axios + JWT interceptor
│   ├── authApi.js            ← Login, Register
│   ├── analyticsApi.js       ← Dashboard, ML metrics
│   ├── hospitalApi.js        ← Hospital CRUD + email report
│   ├── patientApi.js         ← Patient CRUD
│   ├── predictionApi.js      ← Predict, PDF, Timeline
│   ├── modelApi.js           ← FL training, models
│   ├── schedulerApi.js       ← Scheduler status/trigger
│   └── exportApi.js          ← CSV downloads
├── context/
│   ├── AuthContext.jsx       ← User auth state
│   └── MLServiceContext.jsx  ← ML service health
├── hooks/
│   └── useFormValidation.jsx ← Medical field validation
├── components/
│   └── common/
│       ├── Layout.jsx        ← Sidebar + content wrapper
│       ├── Sidebar.jsx       ← Role-based navigation
│       ├── ProtectedRoute.jsx← Auth guard
│       ├── MLServiceBanner.jsx← ML offline warning
│       └── CommandPalette.jsx← Quick navigation
└── pages/
    ├── LoginPage.jsx
    ├── RegisterPage.jsx
    ├── LandingPage.jsx
    ├── DashboardPage.jsx
    ├── HospitalsPage.jsx
    ├── PatientsPage.jsx
    ├── PredictPage.jsx      
    ├── PredictionsPage.jsx
    ├── ModelsPage.jsx
    ├── AnalyticsPage.jsx
    ├── SchedulerPage.jsx
    └── ExportPage.jsx
```

---

---

## 👥 Role-Based Navigation

```
ADMIN sees:
├── Dashboard
├── Hospitals    ← Can create/edit/delete
├── Patients
├── Predict Disease
├── Predictions
├── FL Models    ← Can trigger training
├── Analytics
├── Scheduler    ← Admin only
└── Export

HOSPITAL_ADMIN sees:
├── Dashboard
├── Patients     ← Own hospital only
├── Predict Disease
├── Predictions
├── Analytics
└── Export
```

---




## 🔗 Related Repositories

| Repository | Tech | Description |
|---|---|---|
| [FedMedAI-backend](https://github.com/deepakbhat18/FedMedAI-backend) | Spring Boot | REST API + JWT Auth |
| [FedMedAI-ml-service](https://github.com/deepakbhat18/FedMedAI-ml-service) | FastAPI + Python | ML Models + FL Training |
| **FedMedAI-frontend** | React + Vite | This repo - Web Dashboard |

---


---

<div align="center">

**Built for Privacy-Preserving Medical AI**

⭐ Star this repo if you found it helpful!

</div>
