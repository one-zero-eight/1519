# 🎓 Scholarship Management System

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-323232?style=for-the-badge&logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org/)
[![Pydantic](https://img.shields.io/badge/Pydantic-E92063?style=for-the-badge&logo=pydantic&logoColor=white)](https://pydantic.dev/)
[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TanStack Router](https://img.shields.io/badge/TanStack%20Router-FF4154?style=for-the-badge&logo=react-router&logoColor=white)](https://tanstack.com/router)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Maintained](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/projacktor/1519/graphs/commit-activity)

> 🚀 A comprehensive scholarship management platform for educational institutions, featuring application submission, review processes, and administrative tools.

## ✨ Features

### 🎯 For Students
- **📝 Application Submission**: Easy-to-use form for scholarship applications
- **📄 Document Upload**: Support for CV, transcripts, motivational letters, and more
- **✅ Email Validation**: Automatic validation for institutional email addresses

### 👨‍💼 For Administrators
- **📋 Application Management**: Review and manage all submitted applications
- **🏆 Ranking System**: Drag-and-drop interface for application ranking
- **⏰ Time Window Management**: Control application submission periods
- **📁 File Management**: Secure handling of uploaded documents

### 🔒 For Patrons
- **🎯 Student Selection**: Choose students to support
- **📊 Progress Tracking**: Monitor supported students' progress

### 🔧 Tech Stack

#### Frontend
- **⚛️ React 18** with TypeScript for robust UI development
- **🎨 Material-UI** for beautiful, responsive design
- **🚦 TanStack Router** for type-safe routing
- **⚡ Vite** for lightning-fast development and builds
- **📱 Responsive Design** for mobile and desktop compatibility

#### Backend
- **🚀 FastAPI** for high-performance async API
- **🗄️ PostgreSQL** for reliable data storage
- **🔄 SQLAlchemy** for powerful ORM capabilities
- **✅ Pydantic** for data validation and serialization
- **🔄 Alembic** for database migrations
- **🤖 Telegram Bot** for login

## 🚀 Quick Start

Get the project running in less than 5 minutes!

### Prerequisites

- 🐍 Python 3.9+
- 🟢 Node.js 18+
- 🐳 Docker & Docker Compose (recommended)
- 🗄️ PostgreSQL (if running locally)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/projacktor/1519.git
cd 1519
```

### 2️⃣ Environment Setup

```bash
# Backend configuration
cp backend/.env.example backend/.env
# Edit backend/.env with your configurations

# Frontend configuration  
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your API endpoints
```

### 3️⃣ Start with Docker (Recommended)

```bash
# Build and start all services
cd backend
docker compose up --build -d
```

Since system uses telegram auth use the following setup for frontend:

```bash
cd frontend
docker compose up -d
```

It will use nginx as a proxy for port *3000*

🎉 **That's it!** Your application will be available at:
- 🌐 Frontend: http://127.0.0.1
- 🔧 API: http://127.0.0.1:8888/docs

## ⚙️ Configuration

### Backend Configuration

Edit `settings.yaml` in the backend directory:

```yaml
# Database
# yaml-language-server: $schema=settings.schema.yaml
$schema: "./settings.schema.yaml"
session_secret_key: "null" # Secret key for session management, can be generated with `openssl rand -hex 32`
bot_token: "null" # Telegram bot token, get it from @BotFather
bot_username: "null" # Telegram bot username
superadmin_telegram_id: "null" # Telegram ID of the superadmin user
secret_key: "null"
invite_secret_string: "null"
```

### Frontend Configuration

Edit `.env` in the frontend directory:

```env
VITE_PUBLIC_API=http://127.0.0.1:8888
VITE_PUBLIC_BOT=stp_1519_bot
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### 1️⃣ Fork & Clone
```bash
git clone https://github.com/projacktor/1519.git
cd 1519
```

### 2️⃣ Create Feature Branch
```bash
git checkout -b feature/amazing-feature
```

### 3️⃣ Make Changes
- Follow the existing code style
- Add tests for new features
- Update documentation

### 4️⃣ Commit Changes
```bash
git commit -m "feat: add amazing feature"
```

### 5️⃣ Push & Create PR
```bash
git push origin feature/amazing-feature
```

### 📝 Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation updates
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/modifications
- `chore:` Maintenance tasks

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Error
```bash
# Check if PostgreSQL container is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Connect to database manually
docker-compose exec postgres psql -U postgres -d scholarship_db
```

#### Frontend Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
pnpm install

# Clear Vite cache
rm -rf frontend/node_modules/.vite
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<div align="center">

**🌟 Star this repository if you found it helpful!**

Made with ❤️ by one-zero-eight team

</div>
