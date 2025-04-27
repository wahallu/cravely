import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  getRestaurantToken,
  saveRestaurantAuth,
  removeRestaurantAuth,
} from "../../utils/restaurantAuth";

export const restaurantApi = createApi({
  reducerPath: "restaurantApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5003/api",
    prepareHeaders: (headers) => {
      // Get the token from localStorage
      const token = getRestaurantToken();
      // If we have a token, add it to the headers
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    registerRestaurant: builder.mutation({
      query: (restaurantData) => ({
        url: "/restaurants/register",
        method: "POST",
        body: restaurantData,
      }),
      // Store the token and restaurant info when registration is successful
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          const result = await queryFulfilled;
          if (result.data.token) {
            saveRestaurantAuth(result.data.token, result.data.restaurant);
          }
        } catch (err) {
          console.error("Registration failed:", err);
        }
      },
    }),
    loginRestaurant: builder.mutation({
      query: (credentials) => ({
        url: "/restaurants/login",
        method: "POST",
        body: credentials,
      }),
      // Store the token and restaurant info when login is successful
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          const result = await queryFulfilled;
          if (result.data.token) {
            saveRestaurantAuth(result.data.token, result.data.restaurant);
          }
        } catch (err) {
          console.error("Login failed:", err);
        }
      },
    }),
    getRestaurantProfile: builder.query({
      query: (id) => `/restaurants/all?id=${id}`,
      transformResponse: (response, meta, arg) => {
        const restaurant = response.data.find((r) => r._id === arg);
        return { success: true, data: restaurant };
      },
    }),
    updateRestaurantProfile: builder.mutation({
      query: ({ id, ...restaurantData }) => ({
        url: `/restaurants/${id}`,
        method: "PUT",
        body: restaurantData,
      }),
    }),
    // Add new endpoint to get all restaurants
    getAllRestaurants: builder.query({
      query: () => "/restaurants/all",
      // Provide tags for cache invalidation
      providesTags: ["Restaurants"],
    }),
    // Add a new endpoint to update restaurant status (for admin)
    updateRestaurantStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/restaurants/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      // Invalidate the cache after updating to refresh the data
      invalidatesTags: ["Restaurants"],
    }),
  }),
});

export const {
  useRegisterRestaurantMutation,
  useLoginRestaurantMutation,
  useGetRestaurantProfileQuery,
  useUpdateRestaurantProfileMutation,
  useGetAllRestaurantsQuery,
  useUpdateRestaurantStatusMutation,
} = restaurantApi;
