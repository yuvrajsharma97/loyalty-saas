// /lib/validators.js
const { z } = require("zod");

const registerUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["User", "StoreAdmin", "SuperAdmin"], "Please select a valid role"),
});

const loginWithRoleSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["User", "StoreAdmin", "SuperAdmin"]),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Valid email is required"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(10, "Valid token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

module.exports = {
  registerUserSchema,
  loginWithRoleSchema,
  forgotPasswordSchema,
  resetPasswordSchema
};
