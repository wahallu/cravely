import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getRestaurantToken } from "../../utils/restaurantAuth";

/**
 * Redux Toolkit Query API slice for restaurant orders
 * This handles communication between the Restaurant service and Order service in the microservices architecture
 */
export const restaurantOrderApi = createApi({
  reducerPath: "restaurantOrderApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5002/api", // Adjust this to your actual API URL
    prepareHeaders: (headers) => {
      const token = getRestaurantToken();
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["RestaurantOrder"],
  endpoints: (builder) => ({
    // Get orders for a restaurant
    getRestaurantOrders: builder.query({
      query: ({ restaurantId, status }) => {
        const queryParams = status ? `?status=${status}` : "";
        return `/orders/restaurant/${restaurantId}${queryParams}`;
      },
      transformResponse: (response) => response,
      providesTags: ["RestaurantOrder"],
    }),

    // Update order status
    updateOrderStatus: builder.mutation({
      query: ({ orderId, status }) => ({
        url: `/orders/${orderId}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["RestaurantOrder"],
    }),
  }),
});

// Export the generated hooks
export const { useGetRestaurantOrdersQuery, useUpdateOrderStatusMutation } =
  restaurantOrderApi;
