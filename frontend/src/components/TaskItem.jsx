export default function TaskItem({ task, onToggle, onEdit, onDelete, disabled }) {
  return (
    <div className="task-item">
      <div className="task-left">
        <input
          type="checkbox"
          className="task-checkbox"
          checked={task.completed}
          onChange={() => onToggle(task)}
          disabled={disabled}
        />
        <span className={`task-title ${task.completed ? "completed" : ""}`}>
          {task.title}
        </span>
      </div>
      <div className="task-actions">
        <button
          className="icon-btn"
          disabled={task.completed || disabled}
          onClick={() => onEdit(task)}
        >
          Edit
        </button>
        <button
          className="delete-btn"
          onClick={() => onDelete(task._id)}
          disabled={disabled}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
