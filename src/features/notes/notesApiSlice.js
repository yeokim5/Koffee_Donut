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
      query: ({ page = 1, limit = 10 }) => `/notes?page=${page}&limit=${limit}`,
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      transformResponse: (response) => {
        if (!response || !response.notes) {
          return {
            notes: [],
            currentPage: 1,
            totalPages: 1,
            totalNotes: 0,
          };
        }

        return {
          notes: response.notes.map((note) => ({
            ...note,
            id: note._id || note.id,
          })),
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          totalNotes: response.totalNotes,
        };
      },
      merge: (currentCache, newItems, { arg }) => {
        if (!currentCache) return newItems;

        if (arg.page === 1) {
          return newItems;
        }

        // Create a Set of existing note IDs
        const existingIds = new Set(
          currentCache.notes.map((note) => note.id || note._id)
        );

        // Filter out duplicates from new items
        const uniqueNewNotes = newItems.notes.filter(
          (note) => !existingIds.has(note.id || note._id)
        );

        return {
          ...newItems,
          notes: [...(currentCache.notes || []), ...uniqueNewNotes],
        };
      },
      forceRefetch: ({ currentArg, previousArg }) => {
        return currentArg?.page === 1 || currentArg?.page !== previousArg?.page;
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
        url: `/notes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Note", id: arg.id }],
    }),
    deleteImage: builder.mutation({
      query: (imageUrl) => ({
        url: "/notes/delete-image",
        method: "POST",
        body: { imageUrl },
      }),
    }),
    likeNote: builder.mutation({
      query: ({ id, userId }) => {
        if (!userId) {
          throw new Error("User ID is required for liking a note");
        }
        return {
          url: `/notes/${id}/like`,
          method: "PATCH",
          body: { userId },
        };
      },
      onQueryStarted: async ({ id, userId }, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
        } catch (error) {
          console.error("Like request failed:", error);
        }
      },
      invalidatesTags: (result, error, arg) => [
        { type: "Note", id: arg.id },
        { type: "Note", id: "LIST" },
        { type: "Note", id: "TRENDING" },
      ],
    }),

    dislikeNote: builder.mutation({
      query: ({ id, userId }) => {
        if (!userId) {
          throw new Error("User ID is required for disliking a note");
        }
        return {
          url: `/notes/${id}/dislike`,
          method: "PATCH",
          body: { userId },
        };
      },
      onQueryStarted: async ({ id, userId }, { dispatch, queryFulfilled }) => {
        console.log(
          `Sending dislike request for note ${id} with userId ${userId}`
        );
        try {
          const { data } = await queryFulfilled;
          console.log("Dislike request successful:", data);
        } catch (error) {
          console.error("Dislike request failed:", error);
        }
      },
      invalidatesTags: (result, error, arg) => [
        { type: "Note", id: arg.id },
        { type: "Note", id: "LIST" },
        { type: "Note", id: "TRENDING" },
      ],
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
        const loadedNotes = responseData.map((note) => ({
          ...note,
          id: note._id,
        }));
        return loadedNotes;
      },
      providesTags: [{ type: "Note", id: "TRENDING" }],
    }),

    getFollowerNotes: builder.query({
      query: (username) => `/notes/following/${username}`,
      transformResponse: (responseData) => {
        const loadedNotes = responseData.map((note) => ({
          ...note,
          id: note._id,
        }));
        return loadedNotes;
      },
      providesTags: (result) => [
        { type: "Note", id: "FOLLOWER_LIST" },
        ...(result?.map((note) => ({ type: "Note", id: note.id })) || []),
      ],
    }),

    incrementViews: builder.mutation({
      query: (id) => ({
        url: `/notes/${id}/views`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Note", id: arg }],
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
  useDeleteImageMutation,
  useIncrementViewsMutation,
} = notesApiSlice;
