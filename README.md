# Financial Literacy App

A full-stack web application to help users improve financial knowledge, manage budgets, track expenses, set savings goals, and learn money concepts through interactive tools.

## Technologies Used
- Frontend: HTML, CSS, JavaScript (React.js)
- Backend: Node.js + Express.js
- Database: MongoDB

## Features
- User registration and login
- Interactive financial lessons and quizzes
- Budget planner and expense tracker
- Savings goal setting with progress tracking
- Compound interest calculator
- Responsive design

## How to Run the Project

1. Clone the repository
2. Go to backend folder: cd backend
3. Run: npm install
4. Go to frontend folder: cd ../frontend
5. Run: npm install
6. Create .env file in backend folder with PORT=5000, MONGO_URI=your_mongo_uri, JWT_SECRET=your_secret
7. Start the backend: node index.js (or npm start)
8. Start the frontend: npm start
9. Open in browser: http://localhost:3000

## Project Structure

• backend/index.js – Main backend server  
• backend/models/ – Database schemas (User, Expense, Goal, etc.)  
• backend/routes/ – API endpoints  
• backend/controllers/ – Business logic / request handlers  
• backend/package.json – Backend dependencies  
• frontend/public/ – Static files  
• frontend/src/ – React components, pages, App.js, etc.  
• frontend/package.json – Frontend dependencies  
• README.md – This file
