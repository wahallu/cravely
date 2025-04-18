# Cravely Order Service

This microservice handles order processing, payment integration, and order management for the Cravely food delivery platform.

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file based on the `.env.example` file:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your actual values:
   - Set `MONGO_URI` to your MongoDB connection string
   - Set `JWT_SECRET` to a secure random string
   - Set `STRIPE_SECRET_KEY` to your Stripe API key

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

- `POST /api/orders` - Create a new order
- `GET /api/orders/:id` - Get order details by ID
- `GET /api/orders/user/me` - Get all orders for the current user
- `GET /api/orders/restaurant/:id` - Get all orders for a restaurant
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/orders/:id/cancel` - Cancel an order

## Tech Stack

- Node.js
- Express
- MongoDB with Mongoose
- Stripe for payment processing
- JWT for authentication
