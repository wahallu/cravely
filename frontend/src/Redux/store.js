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
import deliveryReducer from "./slices/deliverySlice";

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
    cart: cartReducer,
    delivery: deliveryReducer,
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
      .concat(userApi.middleware),
});

setupListeners(store.dispatch);
