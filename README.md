# Re3aya Center – Frontend

![React](https://img.shields.io/badge/Frontend-React_19-blue)
![Tailwind](https://img.shields.io/badge/Styles-TailwindCSS-purple)
![Framer Motion](https://img.shields.io/badge/Animations-Framer_Motion-pink)
![Vercel](https://img.shields.io/badge/Deployment-Vercel-black)

Re3aya Frontend is a production-grade React application for managing hospital appointments.  
It provides dashboards for Patients, Doctors, and Admins with role-based navigation and features.

---

## 🚀 Live Demo

Frontend: https://re3aya-center.vercel.app  

---

## 🛠 Tech Stack

- React 19 (Create React App)
- React Router
- Axios
- Tailwind CSS
- Framer Motion
- i18next (Localization)
- react-hot-toast
- @react-oauth/google

---

## 📂 Project Structure

```
front/
├── public/
├── src/
│   ├── components/  # UI modules per role/domain
│   ├── context/     # Auth context/provider
│   ├── pages/       # Page-level containers
│   ├── services/    # API clients
│   ├── utils/       # Helpers
│   ├── i18n.js      # Localization setup
│   └── App.js       # Routing + Providers
└── vercel.json      # Deployment config
```

---

## ⚙️ Installation & Setup

```bash
git clone https://github.com/KareemHossny/Re3aya-Frontend.git
cd front
npm install
npm start
```

Frontend environment variables (`.env`):

```
REACT_APP_API_URL=https://re3aya-backend.vercel.app/api
REACT_APP_GOOGLE_CLIENT_ID=<your_google_client_id>
```

---

## 👨‍💻 Author

Kareem Hossny – Full Stack MERN Developer
