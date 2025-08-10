#personal-budget-tracker

# 💰 Personal Budget Tracker (MERN)

> "Track every rupee, plan every goal."

Welcome to **Personal Budget Tracker** — a smart, full-stack app designed to help you manage your finances efficiently using the powerful **MERN** stack.

---

## 🌐 Live Preview (Coming Soon)
Frontend on Vercel | Backend on Render | MongoDB on Atlas

---

## 🧰 Tech Stack

| Layer      | Tech                     |
|------------|--------------------------|
| Frontend   | React, Axios, Tailwind CSS |
| Backend    | Node.js, Express.js      |
| Database   | MongoDB Atlas            |
| Dev Tools  | Postman, Git, VS Code    |

---

## 🔥 Features

✅ Add, edit, and delete income/expense transactions  
✅ View and filter transactions by date, category, or type  
✅ Set monthly budgets per category  
✅ Securely store data in MongoDB Atlas  
✅ Fully responsive and clean UI (in progress)  
✅ RESTful API architecture  

---

## 📁 Project Structure

```
personal-budget-tracker/
├── client/                 # React frontend (coming soon)
├── server/                 # Express backend
│   ├── model/              # Mongoose schemas (Budget, Transaction)
│   ├── routes/             # API route handlers
│   ├── .env                # MongoDB URI and secrets
│   └── server.js           # Entry point for backend server
```

---

## ⚙️ Getting Started

### 1. Clone the Repo
```bash
git clone https://github.com/your-username/personal-budget-tracker.git
cd personal-budget-tracker
```

### 2. Setup Backend
```bash
cd server
npm install
```

### 3. Create `.env`
```env
MONGO_URI=your-mongodb-atlas-uri
```

### 4. Run the Server
```bash
npm run dev
```
Server will be live at: `http://localhost:5000`

### 5. Test API Endpoints in Postman
- `GET    /api/transactions`
- `POST   /api/transactions`
- `GET    /api/budgets`
- `POST   /api/budgets`

---

## 🧪 Sample API Request

```json
POST /api/transactions
{
  "amount": 1000,
  "type": "income",
  "category": "Salary",
  "date": "2025-08-10"
}
```

---

## 📌 Roadmap

- [x] Backend server setup
- [x] MongoDB Atlas connection
- [x] Transactions & Budget APIs
- [ ] React frontend with form validations
- [ ] Authentication (JWT or session-based)
- [ ] Deploy full-stack project

## 👤 Author

Made with 💻 + ☕ by **Nipun Bansal**  
GitHub: [@NipunBansal]https://github.com/Nipun-11
> "Budgeting isn’t about limiting yourself — it’s about creating freedom."

---

