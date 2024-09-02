import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const notesAdapter = createEntityAdapter({
  sortComparer: (a, b) =>
    a.completed === b.completed ? 0 : a.completed ? 1 : -1,
});

const initialState = notesAdapter.getInitialState();

export const notesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotes: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/notes?page=${page}&limit=${limit}`,
        validateStatus: (response, result) => {
          return response.status === 200 && !result.isError;
        },
      }),
      transformResponse: (responseData) => {
        const loadedNotes = responseData.notes.map((note) => {
          note.id = note._id;
          return note;
        });
        return {
          notes: notesAdapter.setAll(initialState, loadedNotes),
          currentPage: responseData.currentPage,
          totalPages: responseData.totalPages,
          totalNotes: responseData.totalNotes,
        };
      },
      providesTags: (result, error, arg) => {
        if (result?.notes?.ids) {
          return [
            { type: "Note", id: "LIST" },
            ...result.notes.ids.map((id) => ({ type: "Note", id })),
          ];
        } else return [{ type: "Note", id: "LIST" }];
      },
    }),
    addNewNote: builder.mutation({
      query: (initialNote) => ({
        url: "/notes",
        method: "POST",
        body: {
          ...initialNote,
        },
      }),
      invalidatesTags: [{ type: "Note", id: "LIST" }],
    }),
    updateNote: builder.mutation({
      query: (initialNote) => ({
        url: "/notes",
        method: "PATCH",
        body: {
          ...initialNote,
        },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Note", id: arg.id }],
    }),
    deleteNote: builder.mutation({
      query: ({ id }) => ({
        url: `/notes`,
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Note", id: arg.id }],
    }),
    likeNote: builder.mutation({
      query: ({ id, userId }) => ({
        url: `/notes/${id}/like`,
        method: "PATCH",
        body: { userId },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Note", id: arg.id }],
    }),

    dislikeNote: builder.mutation({
      query: ({ id, userId }) => ({
        url: `/notes/${id}/dislike`,
        method: "PATCH",
        body: { userId },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Note", id: arg.id }],
    }),

    getNoteById: builder.query({
      query: (id) => `/notes/${id}`,
      validateStatus: (response, result) => {
        return response.status === 200 && !result.isError;
      },
      transformResponse: (responseData) => {
        const loadedNote = { ...responseData, id: responseData._id };
        return { note: loadedNote };
      },
      providesTags: (result, error, arg) => [{ type: "Note", id: arg }],
    }),

    getNotesByUsername: builder.query({
      query: (username) => `/notes/user/${username}`,
      transformResponse: (responseData) => {
        const loadedNotes = responseData.map((note) => {
          note.id = note._id;
          return note;
        });
        return notesAdapter.setAll(initialState, loadedNotes);
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [
            { type: "Note", id: "LIST" },
            ...result.ids.map((id) => ({ type: "Note", id })),
          ];
        } else return [{ type: "Note", id: "LIST" }];
      },
    }),

    getTrendingNotes: builder.query({
      query: () => `/notes/trending`,
      transformResponse: (responseData) => {
        return responseData;
      },
      providesTags: [{ type: "Note", id: "TRENDING" }],
    }),

    getFollowerNotes: builder.query({
      query: (username) => `/notes/following/${username}`,
      transformResponse: (responseData) => {
        const loadedNotes = responseData.map((note) => {
          note.id = note._id;
          return note;
        });
        return notesAdapter.setAll(initialState, loadedNotes);
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [
            { type: "Note", id: "FOLLOWER_LIST" },
            ...result.ids.map((id) => ({ type: "Note", id })),
          ];
        } else return [{ type: "Note", id: "FOLLOWER_LIST" }];
      },
    }),
  }),
});

export const {
  useGetNotesQuery,
  useGetNoteByIdQuery,
  useAddNewNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
  useLikeNoteMutation,
  useDislikeNoteMutation,
  useGetNotesByUsernameQuery,
  useGetTrendingNotesQuery,
  useGetFollowerNotesQuery,
} = notesApiSlice;
