require("./db/mongoose"); // we dont want to import anything we just want to make sure the mongoose file runs jaise ki mongoose.connect run ho jaega

const express = require("express");
const userouter = require("../src/routers/user");
const taskrouter = require("../src/routers/task");

const app = express();

const multer = require("multer");
const upload = multer({
  dest: "images",
});

app.post("/upload", upload.single("upload"), (req, res) => {
  res.send();
});

app.use(express.json());
app.use(userouter);
app.use(taskrouter);

const port = process.env.PORT;
app.listen(port, () => {
  console.log("Server is up on port " + port);
});
