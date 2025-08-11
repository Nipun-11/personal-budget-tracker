# 💸 Personal Budget Tracker (MERN Stack)

A full-stack web application to track your income, expenses, and budgets — built using the MERN stack (MongoDB, Express.js, React.js, Node.js). Designed to help users manage finances visually and intelligently.

---

## 🚀 Features

### ✅ Week 1: Project Setup
- MERN stack project initialized (Vite + React + Node/Express + MongoDB Atlas)
- Project structure created for client & server
- Version control via GitHub setup
- `.env` and server configuration done

### ✅ Week 2: Core Functionalities
- Backend APIs for **transactions** and **budgets**
- Mongoose schemas and DB connectivity working
- Add/view **transactions** (income & expenses)
- Add/view **budgets** (monthly category limit)
- Basic form UI connected to backend
- GitHub repository created & maintained

### ✅ Week 3: Data Visualization & Insights
- 📊 Dashboard Page:
  - **Pie Chart** for category-wise spending
  - **Bar Chart** for income vs expense
  - **Line Chart** for spending trend over time
- 💰 Summary Cards:
  - Total income, total expenses, savings
- 📅 Filters:
  - Filter transactions by **type**, **month**, **category**
- 🔍 Added **Search** functionality
- ↕️ Added **Sort** (by amount and date)

---

## 🧠 Upcoming: Week 4 - AI & Final Touches
- 🤖 **AI Summary Feature**
  - Summarizes income/expense behavior
  - Suggests savings, overspending alerts
- 🎨 UI/UX Enhancements
- 📥 Export to CSV/PDF (optional)
- 📱 Mobile responsive layout
- 🧪 Final testing and bug fixes

---

## 🧰 Tech Stack

| Frontend         | Backend        | Database      |
|------------------|----------------|---------------|
| React.js (Vite)  | Node.js        | MongoDB Atlas |
| React Router     | Express.js     | Mongoose      |
| Axios            | CORS, Dotenv   |               |
| Chart.js         |                |               |

---

## 📁 Folder Structure
personal-budget-tracker/
├── client/ # Frontend
│ ├── src/
│ │ ├── pages/ # Home, Transactions, Budgets, Dashboard
│ │ ├── components/ # TransactionForm, BudgetForm
│ │ ├── services/ # Axios-based API handlers
│ │ └── App.jsx, main.jsx
│ └── vite.config.js
├── server/ # Backend
│ ├── models/ # Mongoose schemas (Transaction, Budget)
│ ├── routes/ # Express routes (transactions.js, budgets.js)
│ └── server.js
├── .env # MongoDB URI, PORT
├── README.md




## 👤 Author

Made with 💻 + ☕ by **Nipun Bansal**  
GitHub: [@NipunBansal]https://github.com/Nipun-11
> "Budgeting isn’t about limiting yourself — it’s about creating freedom."

---

