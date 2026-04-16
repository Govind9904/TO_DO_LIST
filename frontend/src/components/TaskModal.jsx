import { useEffect, useState } from "react";

export default function TaskModal({ open, onClose, onSave, editTask }) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
    } else {
      setTitle("");
    }
    setError("");
  }, [editTask, open]);

  useEffect(() => {
    if (open) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => document.body.classList.remove("modal-open");
  }, [open]);

  const handleSave = async () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError("Title is required");
      return;
    }

    if (trimmedTitle.length < 3) {
      setError("Title must be at least 3 characters");
      return;
    }

    try {
      setError("");
      await onSave(trimmedTitle);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  if (!open) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>{editTask ? "Edit Task" : "Add Task"}</h3>

        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError(""); // clear error on typing
          }}
          placeholder="Enter task..."
        />

        {/* error message */}
        {error && <p className="error-text">{error}</p>}

        <div className="modal-actions">
          <button className="save-btn" onClick={handleSave}>
            {editTask ? "Update" : "Add"}
          </button>

          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
