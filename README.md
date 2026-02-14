# Financial Literacy App

A full-stack web application to help users improve financial knowledge, manage budgets, track expenses, set savings goals, and learn money concepts through interactive tools.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript (React.js)
- **Backend**: Node.js + Express.js
- **Database**: MongoDB

## Features

- User registration and login
- Interactive financial lessons and quizzes
- Budget planner and expense tracker
- Savings goal setting with progress tracking
- Compound interest calculator
- Responsive design

## How to Run the Project

1. Clone the repository
   ```bash
   git clone <your-repo-url>
   cd Financial-Literacy-App
   ```

2. Backend setup
   ```bash
   cd backend
   npm install
   ```

3. Frontend setup
   ```bash
   cd ../frontend
   npm install
   ```

4. Create `.env` file in **backend** folder
   ```
   PORT=5000
   MONGO_URI=your_mongo_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

5. Start backend
   ```bash
   cd backend
   node index.js
   # or
   npm start
   ```

6. Start frontend (in new terminal)
   ```bash
   cd frontend
   npm start
   ```

7. Open in browser:  
   http://localhost:3000

## Project Structure

### Backend
- `backend/index.js`              → Main server file (Express app setup)
- `backend/models/`               → Mongoose schemas  
  - User.js  
  - Expense.js  
  - Goal.js  
  - etc.
- `backend/routes/`               → API route files  
  - auth.js  
  - budget.js  
  - goals.js  
  - etc.
- `backend/controllers/`          → Business logic / request handlers
- `backend/package.json`          → Backend dependencies & scripts

### Frontend
- `frontend/public/`              → Static assets (index.html, favicon, etc.)
- `frontend/src/`                 → React source code  
  - components/                 → Reusable UI components  
  - pages/                      → Main pages (Dashboard, Budget, Lessons, etc.)  
  - App.js                      → Root component  
  - index.js                    → Entry point
- `frontend/package.json`         → Frontend dependencies & scripts

### Root
- `README.md`                     → This file
