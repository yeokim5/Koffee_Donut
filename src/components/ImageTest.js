import React, { useEffect, useState } from "react";
import axios from "axios";

const ImageTest = () => {
  const [file, setFile] = useState();
  const [image, setImage] = useState("");
  const [message, setMessage] = useState("");

  const handleUpload = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", file);

    axios
      .post("http://localhost:3500/upload", formData)
      .then((res) => {
        console.log(res.data);
        setMessage(res.data.message);
      })
      .catch((error) => {
        console.error(error);
        setMessage(error.response?.data?.error || "An error occurred");
      });
  };

  useEffect(() => {
    axios
      .get("http://localhost:3500/getImage")
      .then((res) => {
        setImage(res.data[0].image);
        setMessage(res.data.message);
      })
      .catch((error) => {
        console.error(error);
        setMessage(error.response?.data?.error || "An error occurred");
      });
  }, []);

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
      {message && <p>{message}</p>}
      <img src={`http://localhost:3500/img/` + image} />
    </div>
  );
};

export default ImageTest;
