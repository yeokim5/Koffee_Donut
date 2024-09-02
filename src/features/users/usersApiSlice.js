import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const usersAdapter = createEntityAdapter({});

const initialState = usersAdapter.getInitialState();

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => ({
        url: "/users/all",
        validateStatus: (response, result) => {
          return response.status === 200 && !result.isError;
        },
      }),
      transformResponse: (responseData) => {
        const loadedUsers = responseData.map((user) => {
          user.id = user._id;
          // Exclude sensitive fields
          const { password, email, ...safeUserData } = user; // Exclude password and email
          return safeUserData; // Return only safe user data
        });
        return usersAdapter.setAll(initialState, loadedUsers);
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [
            { type: "User", id: "LIST" },
            ...result.ids.map((id) => ({ type: "User", id })),
          ];
        } else return [{ type: "User", id: "LIST" }];
      },
    }),
    // New endpoint for getting user data by username
    getUserDataByUsername: builder.query({
      query: (username) => `/users/${username}`, // Adjusted to use username
      transformResponse: (responseData) => {
        responseData.id = responseData._id; // Set the id for the entity
        const { password, ...safeUserData } = responseData; // Exclude password
        return safeUserData; // Return only safe user data
      },
      providesTags: (result, error, arg) => [
        { type: "User", id: result?.id || arg },
      ], // Updated to use result.id
    }),
    addNewUser: builder.mutation({
      query: (initialUserData) => ({
        url: "/users",
        method: "POST",
        body: {
          ...initialUserData,
        },
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),
    updateUser: builder.mutation({
      query: (initialUserData) => ({
        url: "/users",
        method: "PATCH",
        body: {
          ...initialUserData,
        },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "User", id: arg.id }],
    }),
    deleteUser: builder.mutation({
      query: ({ id }) => ({
        url: `/users`,
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "User", id: arg.id }],
    }),
    followUser: builder.mutation({
      query: (username) => ({
        url: `/users/${username}/following`,
        method: "POST",
      }),
      invalidatesTags: (result, error, arg) => [{ type: "User", id: "LIST" }],
    }),
    unFollowUser: builder.mutation({
      query: (username) => ({
        url: `/users/${username}/unfollowing`,
        method: "POST",
      }),
      invalidatesTags: (result, error, arg) => [{ type: "User", id: "LIST" }],
    }),
  }),
});

export const {
  // useGetUsersQuery,
  useAddNewUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useFollowUserMutation,
  useUnFollowUserMutation,
  useGetUserDataByUsernameQuery,
} = usersApiSlice;
