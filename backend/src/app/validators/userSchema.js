const zod = require("zod");

const userSchema = zod.object({
  userName: zod
    .string({
      required_error: "Username is required",
    })
    .min(3, {
      message: "Username must be at least 3 characters",
    })
    .max(100, {
      message: "Username cannot exceed 100 characters",
    }),
  nationalId: zod
    .string({
      required_error: "National ID is required",
    })
    .min(8, {
      message: "National ID must be at least 8 characters",
    })
    .max(20, {
      message: "National ID cannot exceed 20 characters",
    }),
});

module.exports = { userSchema };