import { useEffect, useState } from "react";
import API from "../api";
import TaskModal from "../components/TaskModal";
import TaskItem from "../components/TaskItem";
import Swal from "sweetalert2";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filter, setFilter] = useState("all");
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTasks = async (currentFilter = filter) => {
    setIsFetching(true);
    try {
      const params = currentFilter !== "all" ? { filter: currentFilter } : {};
      const res = await API.get("/tasks", { params });
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchTasks(filter);
  }, [filter]);

  const userName = localStorage.getItem("userName") || "User";

  const handleSave = async (title) => {
    setIsSubmitting(true);
    try {
      if (editTask) {
        await API.put(`/tasks/${editTask._id}`, { title });
      } else {
        await API.post("/tasks", { title });
      }

      setModalOpen(false);
      await fetchTasks();
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteTask = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to recover this task!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6366f1",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      setIsSubmitting(true);
      try {
        await API.delete(`/tasks/${id}`);

        Swal.fire({
          title: "Deleted!",
          text: "Your task has been deleted.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        await fetchTasks();
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const toggleTask = async (task) => {
    setIsSubmitting(true);
    try {
      await API.put(`/tasks/${task._id}`, {
        completed: !task.completed,
      });
      await fetchTasks();
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    window.location.href = "/";
  };

  return (
    <div className="dashboard">
      {/* HEADER */}
      <div className="dashboard-header">
        <div className="header-left">
          <h2>Task Manager</h2>
        </div>
        <div className="filter-select">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="custom-select"
            disabled={isFetching || isSubmitting}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="header-right">
          <button
            className="primary-btn"
            onClick={() => {
              setEditTask(null);
              setModalOpen(true);
            }}
            disabled={isSubmitting}
          >
            + New Task
          </button>

          <div className="user-menu">
            <div className="avatar">{userName.charAt(0).toUpperCase()}</div>
            <div className="dropdown">
              <p className="user-name">{userName}</p>

              <button onClick={logout}>Logout</button>
            </div>
          </div>
        </div>
      </div>

      {/* TASK LIST */}
      <div className="task-list">
        {isFetching ? (
          <div className="loader-row">
            <span className="loader-spinner" aria-hidden="true" />
            <span>Loading tasks...</span>
          </div>
        ) : tasks.length === 0 ? (
          <p style={{ textAlign: "center", color: "#94a3b8" }}>No tasks yet</p>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              onToggle={toggleTask}
              onEdit={(task) => {
                setEditTask(task);
                setModalOpen(true);
              }}
              onDelete={deleteTask}
              disabled={isSubmitting}
            />
          ))
        )}
      </div>

      {/* MODAL */}
      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editTask={editTask}
        loading={isSubmitting}
      />
    </div>
  );
}
