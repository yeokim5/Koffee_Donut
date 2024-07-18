import { Link } from "react-router-dom";
import NotesList from "../features/notes/NotesList";

const Public = () => {
  const content = (
    <section>
      <main>
        <NotesList />
      </main>
    </section>
  );
  return content;
};
export default Public;
