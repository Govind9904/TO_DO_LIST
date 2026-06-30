const router = require("express").Router();
const Task = require("../models/Task");
const auth = require("../middleware/auth");


router.get("/health", async (req, res) => {
  try {
    const count = await Task.countDocuments();

    res.json({
      success: true,
      database: "Connected",
      totalTasks: count,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      database: "Disconnected",
    });
  }
});

// Add Task
router.post("/", auth, async (req, res) => {
  try {
    let {
  title,
  description,
  priority,
  category,
  dueDate,
} = req.body;

    // normalize
    title = title?.trim();
    description = description?.trim();

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
      description,
      priority,
      category,
      dueDate,
    });

    await task.save();

    return res.status(201).json(task);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
});
// Get Tasks
router.get("/task", auth, async (req, res) => {
  try {
    const { filter } = req.query; // ?filter=completed / ?filter=pending
    const query = { userId: req.user.id };

    if (filter === "completed") query.completed = true;
    if (filter === "pending") query.completed = false;

    const tasks = await Task.find(query).sort({ createdAt : -1});
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update Task
router.put("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      priority,
      category,
      dueDate,
      completed,
    } = req.body;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // optional: prevent updating other user's task
    if (task.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updateData = {};

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (priority !== undefined) updateData.priority = priority;
    if (category !== undefined) updateData.category = category;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (completed !== undefined) updateData.completed = completed;

    const updatedTask = await Task.findByIdAndUpdate(
      id,updateData,
      {
        new: true,
        runValidators: true,
      }
    );

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

// Filter Tasks
// Filter + Search + Pagination + Sorting
router.get("/filter", auth, async (req, res) => {
  try {
    const {
      completed,
      priority,
      category,
      search,
      dueDate,
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "desc",
    } = req.query;

    const query = {
      userId: req.user.id,
    };

    // Completed Filter
    if (completed === "true") {
      query.completed = true;
    } else if (completed === "false") {
      query.completed = false;
    }

    // Priority
    if (priority) {
      query.priority = priority;
    }

    // Category
    if (category) {
      query.category = category;
    }

    // Search
    if (search) {
      query.title = {
        $regex: search,
        $options: "i",
      };
    }

    // Due Date
    if (dueDate) {
      const start = new Date(dueDate);
      const end = new Date(dueDate);
      end.setDate(end.getDate() + 1);

      query.dueDate = {
        $gte: start,
        $lt: end,
      };
    }

    const pageNumber = Math.max(parseInt(page) || 1, 1);
    const pageLimit = Math.min(
      Math.max(parseInt(limit) || 10, 1),
      50
    );

    const totalTasks = await Task.countDocuments(query);

    const tasks = await Task.find(query)
      .sort({
        [sort]: order === "asc" ? 1 : -1,
      })
      .skip((pageNumber - 1) * pageLimit)
      .limit(pageLimit);

    return res.json({
      success: true,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalTasks / pageLimit),
      totalTasks,
      limit: pageLimit,
      hasNextPage: pageNumber < Math.ceil(totalTasks / pageLimit),
      hasPreviousPage: pageNumber > 1,
      data: tasks,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
