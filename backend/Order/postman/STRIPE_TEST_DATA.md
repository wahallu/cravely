# Stripe Test Data for Cravely Order API

When using Postman to test the Order API with credit card payments, you can use these Stripe test credentials.

## Test Cards

| Card Number       | Brand      | CVC          | Date            | Result                 |
|-------------------|------------|--------------|-----------------|------------------------|
| 4242424242424242  | Visa       | Any 3 digits | Any future date | Successful payment     |
| 4000002500003155  | Visa       | Any 3 digits | Any future date | Requires authentication|
| 4000000000009995  | Visa       | Any 3 digits | Any future date | Insufficient funds     |
| 4000000000000002  | Visa       | Any 3 digits | Any future date | Card declined          |
| 5555555555554444  | Mastercard | Any 3 digits | Any future date | Successful payment     |
| 378282246310005   | Amex       | Any 4 digits | Any future date | Successful payment     |

## PaymentMethod IDs

For direct API testing, you can use these pre-defined Stripe test payment method IDs:

- `pm_card_visa`
- `pm_card_visa_debit`
- `pm_card_mastercard`
- `pm_card_mastercard_debit`
- `pm_card_amex`

## Example Usage in Order API Request

```json
{
  "payment": {
    "method": "creditCard",
    "paymentMethodId": "pm_card_visa",
    "saveCard": true
  }
}
```

## Testing Saved Cards

If you want to test with a saved card, use this format:

```json
{
  "payment": {
    "method": "creditCard",
    "cardId": "card_123456789"
  }
}
```

> Note: You'll need to first save a card and then use the returned card ID.
