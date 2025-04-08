import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getRestaurantToken } from "../../utils/restaurantAuth";

export const mealApi = createApi({
  reducerPath: "mealApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5003/api",
    prepareHeaders: (headers) => {
      const token = getRestaurantToken();
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  transformErrorResponse: (response, meta, arg) => {
    const errMsg = response.data?.error || "An error occurred";
    if (errMsg.includes("authorized")) {
      // Handle authorization errors specially
      console.error("Authorization error:", errMsg);
      // Could redirect to login or show special message
    }
    return response;
  },
  tagTypes: ["Meal", "Menu"],
  endpoints: (builder) => ({
    // Meal endpoints
    getMeals: builder.query({
      query: () => "/meals",
      transformResponse: (response) => {
        console.log("Meals received:", response.data.length);
        return response.data;
      },
      providesTags: ["Meal"],
    }),
    getMeal: builder.query({
      query: (id) => `/meals/${id}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, id) => [{ type: "Meal", id }],
    }),
    addMeal: builder.mutation({
      query: (meal) => ({
        url: "/meals",
        method: "POST",
        body: meal,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ["Meal"],
    }),
    updateMeal: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/meals/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "Meal", id },
        "Meal",
      ],
    }),
    deleteMeal: builder.mutation({
      query: (id) => ({
        url: `/meals/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Meal"],
    }),
    // Public endpoint for accessing meals from a specific restaurant
    getPublicRestaurantMeals: builder.query({
      query: (restaurantId) =>
        `/meals/public/restaurants/${restaurantId}/meals`,
      transformResponse: (response) => response.data,
      providesTags: ["Meal"],
    }),
  }),
});

export const {
  useGetMealsQuery,
  useGetMealQuery,
  useAddMealMutation,
  useUpdateMealMutation,
  useDeleteMealMutation,
  useGetPublicRestaurantMealsQuery,
} = mealApi;
