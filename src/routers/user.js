const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const router = new express.Router();
const multer = require("multer");
const sharp = require("sharp");
const { sendwelcomeEmail, goodbyeemail } = require("../emails/account");

router.post("/users", async (req, res, next) => {
  const user = new User(req.body);
  try {
    await user.save();
    sendwelcomeEmail(user.email, user.name);
    const token = await user.generateauthtoken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/users/login", async (req, res) => {
  try {
    //findByCredentials is a function that we made
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateauthtoken();

    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.get("/users/me", auth, async (req, res, next) => {
  res.send(req.user);
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.post("/users/logoutall", auth, async (req, res, next) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send("all users logged out");
  } catch (e) {
    res.status(500).send();
  }
});

router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedupdates = ["name", "email", "password", "age"];
  const isvalidoperation = updates.every((update) => {
    return allowedupdates.includes(update);
  });
  if (!isvalidoperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }
  try {
    const user = req.user;
    updates.forEach((update) => {
      user[update] = req.body[update];
    });
    await user.save();
    res.send(user);

    // we have removed this cause it bypasses the middleware->pre->save
    //const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });
    if (!user) {
      return res.status(404).send();
    }
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    const user = req.user;
    await req.user.remove();
    goodbyeemail(user.email, user.name);
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});

const upload = multer({
  limits: {
    fileSize: 10000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("File must be a image"));
    }
    cb(undefined, true);
  },
});

router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();

    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (err, req, res, next) => {
    res.status(400).send({ error: err.message });
  }
);

router.delete(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
  }
);

router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set("content-Type", "image/png");
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send();
  }
});

module.exports = router;
