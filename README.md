# KiwiCare – Backend API (NestJS)

A production-ready backend API built with NestJS for the KiwiCare platform.  
This project recreates core server-side features from a commercial app, adapted and open-sourced here.

---

## ✨ Features

- Modular and maintainable NestJS project structure
- RESTful API design
- User authentication and role-based access control
- Invoice management
- Order management
- AWS integration (e.g. S3)
- Mapbox geolocation support
- Email sending (Mailer module)

---

## 📂 Project Structure

```
kiwi-care-backend/
├── config/ # App configuration files
├── dist/ # Production build
├── docs/ # Documentation
├── node_modules/
├── src/
│ ├── auth/ # Authentication and auth guards
│ ├── aws/ # AWS S3 integrations
│ ├── category/ # Category module
│ ├── core/ # Core utilities
│ │ ├── enums/
│ │ ├── filter/
│ │ ├── interceptor/
│ │ ├── lib/
│ │ └── middleware/
│ ├── utils/ # Utility functions
│ ├── db/ # Database module and connections
│ ├── invoices/ # Invoice management
│ ├── mailer/ # Email sending
│ ├── mapbox/ # Mapbox geolocation support
│ ├── orders/ # Order management
│ ├── posts/ # Posts (if applicable)
│ ├── providers/ # Service providers
│ ├── tag/ # Tagging system
│ └── user/ # User management
```

---

## 🚀 Deployment

This project is deployed on **AWS**, production-ready with CI/CD workflows.
