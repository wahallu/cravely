import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { authApi } from "./slices/authSlice";
import { restaurantApi } from "./slices/restaurantSlice";
import { mealApi } from "./slices/mealSlice";
import { menuApi } from "./slices/menuSlice";
import cartReducer from "./slices/cartSlice";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [restaurantApi.reducerPath]: restaurantApi.reducer,
    [mealApi.reducerPath]: mealApi.reducer,
    [menuApi.reducerPath]: menuApi.reducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(restaurantApi.middleware)
      .concat(mealApi.middleware)
      .concat(menuApi.middleware),
});

setupListeners(store.dispatch);
