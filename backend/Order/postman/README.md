# Cravely Cart API Testing

This directory contains Postman collections and environments for testing the Cravely cart API endpoints.

## Getting Started

1. Install [Postman](https://www.postman.com/downloads/) if you haven't already.
2. Import the collection file: `CartRoutes.postman_collection.json`
3. Import the environment file: `CartRoutes_Environment.postman_environment.json`
4. Select the "Cravely Cart Testing" environment in Postman.
5. Update the `authToken` variable with a valid authentication token.

## Environment Variables

The collection uses the following environment variables:

- `baseUrl`: The base URL for your API (default: http://localhost:5002)
- `authToken`: Your authentication token for accessing protected routes

## Collection Contents

This collection includes tests for:

1. **Get Cart Contents**: Retrieve the current user's cart.
2. **Add Item to Cart**: Add a new item to the cart.
3. **Update Cart Item**: Change the quantity of an item in the cart.
4. **Remove Item from Cart**: Remove a specific item from the cart.
5. **Clear Cart**: Remove all items from the cart.

Plus error testing:

1. **Add Item to Cart (Bad Request)**: Test error handling for missing required fields.
2. **Update Cart Item (Bad Request)**: Test error handling for missing quantity field.

## Authentication Note

Remember that the auth middleware has been temporarily disabled for testing, but the collection is set up with the proper Authorization headers for when you re-enable it.

The current implementation in `auth.js` automatically assigns admin credentials:

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

This allows you to test all endpoints without a valid JWT token.
