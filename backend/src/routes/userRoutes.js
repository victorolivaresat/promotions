// routes/userRoutes.js
const express = require("express");
const routes = express.Router();
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  restoreUser,
  getUserByNumDoc
} = require("../app/controllers/userController");
const authRequired = require("../app/middlewares/validateToken");
const { validateSchema } = require("../app/middlewares/validateSchema");
const { userSchema } = require("../app/validators/userSchema");

routes.post(
  "/users",
  authRequired,
  validateSchema(userSchema),
  createUser
);
routes.get("/users", authRequired, getAllUsers);
routes.get("/users/:id", authRequired, getUserById);
routes.get("/users/document/:id", authRequired, getUserByNumDoc);
routes.put("/users/:id", authRequired, validateSchema(userSchema), updateUser);
routes.delete("/users/:id", authRequired, deleteUser);
routes.put("/users/restore/:id", restoreUser);


module.exports = routes;