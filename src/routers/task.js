const express = require("express");
const Task = require("../models/task");
const router = new express.Router();
const auth = require("../middleware/auth");

router.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

//get/tasks?completed=true
//get /task?limit=10&skip=10
// get /tasls?sortby=createdAt_asc
router.get("/tasks", auth, async (req, res, next) => {
  // we are noto sure ki match mein kuch hoga isliye aise karke object banaya hai

  const sort = {};
  const match = {};
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }
  try {
    await req.user.populate({
      path: "tasks",
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort,
      },
    });

    res.send(req.user.tasks);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.get("/tasks/:id", auth, async (req, res, next) => {
  _id = req.params.id;

  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send("error");
    }
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.patch("/tasks/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  console.log(updates);
  const allowedupdates = ["description", "completed"];
  const isvalidoperation = updates.every((update) => {
    return allowedupdates.includes(update);
  });
  if (!isvalidoperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }

    updates.forEach((update) => {
      task[update] = req.params[update];
    });
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) res.status(404).send();
    res.send(task);
  } catch (e) {
    res.status(400).send();
  }
});

module.exports = router;
