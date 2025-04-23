# Cravely Notification Service

This microservice handles SMS notifications for the Cravely food delivery platform using Twilio.

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file based on the `.env.example` file:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your Twilio credentials:
   - Set `TWILIO_ACCOUNT_SID` to your Twilio Account SID
   - Set `TWILIO_AUTH_TOKEN` to your Twilio Auth Token
   - Set `TWILIO_PHONE_NUMBER` to your Twilio phone number

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

- `POST /api/notifications/sms` - Send a custom SMS notification
- `POST /api/notifications/order-status` - Send an order status notification
- `GET /api/notifications/user/:userId` - Get notification history for a user

## Integration with Order Service

To integrate with the Order Service for automatic order status notifications:

1. When an order status changes, send a request to the Notification Service
2. Include the `orderId` and `userId` in the request body
3. The Notification Service will fetch the order and user details and send the notification

## Tech Stack

- Node.js
- Express
- MongoDB with Mongoose
- Twilio API for SMS messaging
