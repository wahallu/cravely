# Testing Cravely Order API with Postman

This directory contains a Postman collection and environment for testing the Cravely Order API.

## Prerequisites

1. [Postman](https://www.postman.com/downloads/) installed
2. Cravely backend services running:
   - Gateway service (port 5000)
   - Order service (port 5002)
   - User service (for authentication)

## Setup Instructions

1. Import the collection and environment files into Postman:
   - `Cravely_Order_API.postman_collection.json`
   - `Cravely_Environment.postman_environment.json`

2. Select the "Cravely Environment" from the environment dropdown in Postman

3. **Authentication**:
   - First, run the "Login" request to get an auth token
   - This will automatically set the `auth_token` environment variable for use in other requests

## Testing Workflow

1. **Create Order**:
   - Use "Create Order" to make a new order with credit card payment
   - Use "Create Order (Cash Payment)" to make a new order with cash on delivery

2. **View Orders**:
   - Use "Get Order By ID" to view a specific order (update the order ID in the URL)
   - Use "Get My Orders" to view all orders for the current user
   - Use "Get Restaurant Orders" to view all orders for a specific restaurant

3. **Update Orders**:
   - Use "Update Order Status" to change an order's status
   - Use "Cancel Order" to cancel an order

## Troubleshooting

- **Authentication Issues**: Make sure the login request completed successfully and the auth token is correctly set
- **404 Errors**: Verify the Order ID or Restaurant ID in the request URL
- **500 Errors**: Check the server logs for more information

## Testing Without Authentication

Authentication has been temporarily disabled in the middleware to facilitate testing. The current implementation in `auth.js` automatically assigns admin credentials to all requests:

```js
// In /backend/Order/middleware/auth.js
const protect = async (req, res, next) => {
  // For testing only - skip authentication
  req.user = { _id: 'testuser123', role: 'admin' };
  next();
  return;
  
  // Original authentication code below...
}
```

This means you can test all endpoints without needing to provide a valid JWT token.

> **NOTE**: For production deployment, remove the testing code and revert to the original authentication implementation.
