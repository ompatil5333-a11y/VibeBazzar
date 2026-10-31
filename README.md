# VibeBazzar

Full-stack eCommerce application built with React, Vite, Node.js/Express, and Supabase / PostgreSQL.

## Features

- **Frontend**: Modern responsive UI with React (Vite), shopping cart, wishlist, product categories, deal of the day, and quick view modal.
- **Backend**: Node.js & Express REST API with JWT authentication and Supabase / PostgreSQL database integration.
- **Payments**: Razorpay payment gateway integration.

## Project Structure

```
├── client/                 # React frontend application (Vite)
├── server/                 # Node.js Express REST API backend
├── anon-ecommerce-website/ # Static template and design assets
├── package.json            # Root scripts & configuration
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Environment Setup
Configure your `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

### Run Frontend
```bash
cd client
npm install
npm run dev
```

### Run Backend
```bash
cd server
npm install
npm run dev
```
