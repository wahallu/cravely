import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getRestaurantToken } from "../../utils/restaurantAuth";

export const menuApi = createApi({
  reducerPath: "menuApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5003/api",
    prepareHeaders: (headers) => {
      const token = getRestaurantToken();
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),transformErrorResponse: (response, meta, arg) => {
    const errMsg = response.data?.error || "An error occurred";
    if (errMsg.includes("authorized")) {
      // Handle authorization errors specially
      console.error("Authorization error:", errMsg);
      // Could redirect to login or show special message
    }
    return response;
  },
  tagTypes: ["Menu"],
  endpoints: (builder) => ({
    // Menu endpoints
    getMenus: builder.query({
      query: () => "/menus",
      transformResponse: (response) => response.data,
      providesTags: ["Menu"],
    }),
    getMenu: builder.query({
      query: (id) => `/menus/${id}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, id) => [{ type: "Menu", id }],
    }),
    addMenu: builder.mutation({
      query: (menu) => ({
        url: "/menus",
        method: "POST",
        body: menu,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ["Menu"],
    }),
    updateMenu: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/menus/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "Menu", id },
        "Menu",
      ],
    }),
    deleteMenu: builder.mutation({
      query: (id) => ({
        url: `/menus/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Menu"],
    }),
    // Public endpoints for accessing menus from a specific restaurant
    getRestaurantPublicMenus: builder.query({
      query: (restaurantId) => `/menus/public/restaurants/${restaurantId}/menus`,
      transformResponse: (response) => response.data,
    }),
  }),
});

export const {
  useGetMenusQuery,
  useGetMenuQuery,
  useAddMenuMutation,
  useUpdateMenuMutation,
  useDeleteMenuMutation,
  useGetRestaurantPublicMenusQuery,
} = menuApi;