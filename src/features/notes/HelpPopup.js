import React, { useCallback } from "react";
import "./HelpPopup.css";

const HelpPopup = ({ isOpen, onClose }) => {
  const handleOverlayClick = useCallback(
    (e) => {
      // Only close if clicking the overlay itself, not its children
      if (e.target.className === "popup-overlay") {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div className="popup-overlay" onClick={handleOverlayClick}>
      <div className="popup-content">
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        <h2>How to Upload, Edit, and Delete Notes</h2>

        <div className="help-section">
          <h3>1. Adding Content</h3>
          <p>
            Navigate to the "Content" section and click the plus (+) icon to add
            new content. Alternatively, you can start typing directly.
          </p>
          <img
            src="https://koffee-donut.s3.us-east-1.amazonaws.com/1.jpeg"
            alt="Adding content"
          />
        </div>

        <div className="help-section">
          <h3>2. Modifying Content</h3>
          <p>
            Select the content you wish to modify. Use the six-dot icon to
            rearrange items or delete them by dragging or clicking.
          </p>
          <img
            src="https://koffee-donut.s3.us-east-1.amazonaws.com/2.jpeg"
            alt="Modifying content"
          />
        </div>

        <div className="help-section">
          <h3>3-5. Embedding Content</h3>
          <p>To embed content:</p>
          <p>1. Click the "Embed" option after selecting the plus (+) icon.</p>
          <img
            src="https://koffee-donut.s3.us-east-1.amazonaws.com/3.jpeg"
            alt="Embedding step 1"
          />
          <p>2. Copy the link of the content you wish to embed.</p>
          <img
            src="https://koffee-donut.s3.us-east-1.amazonaws.com/4.jpg"
            alt="Embedding step 2"
          />
          <p>
            3. Paste the link into the designated input box and press Enter or
            click outside the box to confirm.
          </p>
          <img
            src="https://koffee-donut.s3.us-east-1.amazonaws.com/5.jpeg"
            alt="Embedding step 3"
          />
        </div>

        <div className="help-section">
          <h3>6. Saving Your Note</h3>
          <p>
            Once you finish creating or editing your note, click the "Save"
            button at the top of the screen to upload it.
          </p>
          <img
            src="https://koffee-donut.s3.us-east-1.amazonaws.com/6.jpeg"
            alt="Saving note"
          />
        </div>

        <div className="help-section">
          <h3>7-8. Editing Existing Notes</h3>
          <p>
            To edit an existing note, open it and click the "Edit" button. From
            there, you can make changes or delete the note if needed.
          </p>
          <img
            src="https://koffee-donut.s3.us-east-1.amazonaws.com/7.jpeg"
            alt="Edit button"
          />
          <img
            src="https://koffee-donut.s3.us-east-1.amazonaws.com/8.jpeg"
            alt="Edit options"
          />
        </div>
      </div>
    </div>
  );
};

export default HelpPopup;
