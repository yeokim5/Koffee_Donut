import { useParams } from "react-router-dom";
import EditNoteForm from "./EditNoteForm";
import { useGetNoteByIdQuery } from "./notesApiSlice";
import { useGetUserDataByUsernameQuery } from "../users/usersApiSlice";
import useAuth from "../../hooks/useAuth";
import PulseLoader from "react-spinners/PulseLoader";
import useTitle from "../../hooks/useTitle";

const EditNote = () => {
  useTitle("Edit Note");

  const { id } = useParams();

  const { data: noteData, isLoading: isNoteLoading } = useGetNoteByIdQuery(id);

  if (!noteData?.note) return <p>Note data not found!</p>;

  const content = <EditNoteForm note={noteData.note} />;

  return content;
};

export default EditNote;
