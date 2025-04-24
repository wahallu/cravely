import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { authApi } from "./slices/authSlice";
import { restaurantApi } from "./slices/restaurantSlice";
import { mealApi } from "./slices/mealSlice";
import { menuApi } from "./slices/menuSlice";
import { orderApi } from "./slices/orderSlice";
import { cartApi } from "./slices/cartApiSlice";
import { paymentApi } from "./slices/paymentSlice";
import { shippingAddressApi } from "./slices/shippingAddressSlice";
import { userApi } from "./slices/userSlice";
import cartReducer from "./slices/cartSlice";
import { deliveryApi } from "./slices/deliverySlice";
import { driverApi } from "./slices/driverSlice";
import { restaurantOrderApi } from "./slices/restaurantOrderApi";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [restaurantApi.reducerPath]: restaurantApi.reducer,
    [mealApi.reducerPath]: mealApi.reducer,
    [menuApi.reducerPath]: menuApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [shippingAddressApi.reducerPath]: shippingAddressApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [driverApi.reducerPath]: driverApi.reducer,
    [deliveryApi.reducerPath]: deliveryApi.reducer,
    [restaurantOrderApi.reducerPath]: restaurantOrderApi.reducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(restaurantApi.middleware)
      .concat(mealApi.middleware)
      .concat(menuApi.middleware)
      .concat(orderApi.middleware)
      .concat(cartApi.middleware)
      .concat(shippingAddressApi.middleware)
      .concat(paymentApi.middleware)
      .concat(userApi.middleware)
      .concat(driverApi.middleware)
      .concat(deliveryApi.middleware)
      .concat(restaurantOrderApi.middleware),
});

setupListeners(store.dispatch);
