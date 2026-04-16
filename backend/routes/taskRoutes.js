const router = require("express").Router();
const Task = require("../models/Task");
const auth = require("../middleware/auth");

// Add Task
router.post("/", auth, async (req, res) => {
  try {
    let { title } = req.body;

    // normalize
    title = title?.trim();

    // required validation
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // length validation
    if (title.length < 3) {
      return res
        .status(400)
        .json({ message: "Title must be at least 3 characters" });
    }

    const task = new Task({
      userId: req.user.id,
      title,
    });

    await task.save();

    return res.status(201).json(task);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
});
// Get Tasks
router.get("/", auth, async (req, res) => {
  try {
    const { filter } = req.query; // ?filter=completed / ?filter=pending
    const query = { userId: req.user.id };

    if (filter === "completed") query.completed = true;
    if (filter === "pending") query.completed = false;

    const tasks = await Task.find(query);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update Task
router.put("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // optional: prevent updating other user's task
    if (task.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updatedTask = await Task.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    return res.json(updatedTask);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Delete Task
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // ownership check
    if (task.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Task.findByIdAndDelete(id);

    return res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
