import React from "react";
import NewNoteForm from "./NewNoteForm";
import useTitle from "../../hooks/useTitle";
import useAuth from "../../hooks/useAuth";
import { useGetUserDataByUsernameQuery } from "../users/usersApiSlice";
import PulseLoader from "react-spinners/PulseLoader";
import { useParams } from "react-router-dom";

const NewNote = () => {
  useTitle("New Note");
  const { username } = useAuth();
  console.log(username);

  // Always call the hook, but handle the case where username is not available
  const {
    data: userData,
    isLoading,
    isError,
  } = useGetUserDataByUsernameQuery(username || "", { skip: !username });

  if (isLoading) return <PulseLoader color={"#FFF"} />;
  if (isError) return <div>Error loading user data</div>;

  return <NewNoteForm user={userData || {}} />; // Pass an empty object if userData is null
};

export default NewNote;
