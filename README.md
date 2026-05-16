# UA SCANTRACK: Mobile-Based Barcode Attendance System

_In Partial Fulfillment of the Requirements for the Course of Application Development and Emerging Technologies_

---

## Background of the Study

The proposed system, **UA ScanTrack**, addresses the systemic inefficiencies of traditional attendance monitoring at the University of the Assumption (UA). Despite the availability of digital alternatives, attendance for academic sessions and university-wide events is predominantly recorded through manual, paper-based methods. This conventional approach is prone to logistical challenges, including disorganized documentation, the loss of physical records, and an increased margin for human error, particularly when managing high-volume participant data.

Optimizing attendance tracking is essential for maintaining institutional accountability and supporting data-driven decision-making. Reliable participation data serves as a critical metric for both academic evaluation and organizational management. By implementing a mobile application that utilizes smartphone-based barcode scanning to interface with existing student IDs, UA ScanTrack seeks to digitize the tracking process.

---

## Objectives of the Study

The primary objective of this study is to develop a smartphone-based barcode scanning system that automates attendance monitoring, replacing traditional paper-based methods with a reliable digital framework. The specific objectives are as follows:

1. **To develop a mobile scanning module** that uses smartphone cameras to read student ID barcodes quickly and accurately.
2. **To establish a centralized database** for real-time data storage, ensuring that attendance is recorded automatically to replace manual paper logs.
3. **To create a dual-user interface** that allows students to view their own records and administrators to manage events and generate reports.
4. **To implement a secure PIN-based login** to ensure that only authorized assistants can access and operate the system.

---

## Proponents

- Alejos, Theeanna Jether D.
- Dela Pena, Stephany Ann S.
- Pastoral, Graciella E.

---

## Table of Contents

- [Background of the Study](#background-of-the-study)
- [Objectives of the Study](#objectives-of-the-study)
- [Project Structure](#project-structure)
- [Features](#features)
- [Requirements](#requirements)
- [Setup Instructions](#setup-instructions)
  - [Backend (Django)](#backend-django)
  - [Mobile App (Expo/React Native)](#mobile-app-exporeact-native)
- [Project Structure Explained](#project-structure-explained)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Project Structure

```
.
├── backend/   # Django backend API
│   ├── core/
│   ├── backend/
│   ├── db.sqlite3
│   └── manage.py
├── mobile/    # Expo (React Native) mobile app
│   ├── App.js
│   ├── src/
│   └── ...
└── .venv/     # Python virtual environment (should not be committed)
```

---

## Features

- Backend RESTful API with Django (Python)
- Frontend mobile app with React Native & Expo (JavaScript/TypeScript)
- Real-time barcode-based attendance logging
- Dual-user interface: Student and Administrator
- Secure PIN-based login for authorized assistants
- Automated centralized data storage and reporting
- Modular and extensible design

---

## Requirements

### Backend

- Python 3.9+
- Django (recommended: 4.x)
- [See `requirements.txt` if available for dependencies]
- SQLite is the default DB for dev; production may use PostgreSQL, etc.

### Mobile

- Node.js (18+ recommended)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

---

## Setup Instructions

### 1. Backend (Django)

a. Navigate to backend directory

```bash
cd backend
```

b. (Recommended) Setup a Python virtual environment

```bash
python -m venv .venv
source .venv/bin/activate       # Linux/macOS
# OR
.venv\Scripts\activate         # Windows
```

c. Install dependencies

```bash
pip install django djangorestframework
# Optionally install requirements.txt if provided:
# pip install -r requirements.txt
```

d. Apply database migrations

```bash
python manage.py migrate
```

e. Run development server

```bash
python manage.py runserver
```

_Server will run at http://127.0.0.1:8000_

---

### 2. Mobile App (Expo/React Native)

a. Navigate to mobile directory

```bash
cd mobile
```

b. Install dependencies

```bash
npm install
# or
yarn
```

c. Start the Expo development server

```bash
npx expo start
```

You can use [Expo Go](https://expo.dev/go) to run the app on your mobile device or launch the app in an emulator/simulator.

---

## Project Structure Explained

### Backend

- `backend/`: Django project settings, URLs, WSGI/ASGI config.
- `core/`: Main Django app—models, views, serializers, admin setup, and custom logic.
- `db.sqlite3`: Default local database (auto-generated).

### Mobile

- `App.js`: Entry point for the Expo app.
- `src/`, `components/`, `hooks/`, etc.: Standard React Native app organization.

---

## Acknowledgments

- Powered by [Django](https://www.djangoproject.com/) and [Django REST Framework](https://www.django-rest-framework.org/)
- Frontend via [Expo](https://expo.dev/) and [React Native](https://reactnative.dev/)

---
