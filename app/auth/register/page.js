"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import PasswordField from "@/components/ui/PasswordField";
import Select from "@/components/ui/Select";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = "Please select a role";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      setErrors({}); // Clear any previous errors

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
          }),
        });

        const data = await response.json();

        if (data.ok) {
          // Registration successful, redirect to login
          router.push("/auth/login?message=Registration successful. Please log in.");
        } else {
          // Handle API errors
          if (data.details && Array.isArray(data.details)) {
            const fieldErrors = {};
            data.details.forEach((detail) => {
              if (detail.path && detail.path[0]) {
                fieldErrors[detail.path[0]] = detail.message;
              }
            });
            setErrors(fieldErrors);
          } else {
            setErrors({ general: data.error || "Registration failed" });
          }
        }
      } catch (error) {
        console.error("Registration error:", error);
        setErrors({ general: "An unexpected error occurred" });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleGoogleSignup = () => {
    console.log("Google signup clicked (placeholder)");
  };

  return (
    <main>
      <AuthCard
        title="Create your account"
        subtitle="Start your loyalty program journey">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-400">
              {errors.general}
            </div>
          )}

          {/* Name Field */}
          <div>
            <Label htmlFor="name" required>
              Full name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange("name")}
              error={errors.name}
              autoComplete="name"
            />
          </div>

          {/* Email Field */}
          <div>
            <Label htmlFor="email" required>
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange("email")}
              error={errors.email}
              autoComplete="email"
            />
          </div>

          {/* Password Field */}
          <PasswordField
            id="password"
            label="Password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange("password")}
            error={errors.password}
            required
            showHint={true}
          />

          {/* Confirm Password Field */}
          <PasswordField
            id="confirmPassword"
            label="Confirm password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange("confirmPassword")}
            error={errors.confirmPassword}
            required
          />

          {/* Role Field */}
          <div>
            <Label htmlFor="role" required>
              Role
            </Label>
            <Select
              id="role"
              value={formData.role}
              onChange={handleChange("role")}
              error={errors.role}
              variant={errors.role ? "error" : "primary"}
              className="w-full">
              <option value="">Select your role</option>
              <option value="SuperAdmin">Super Admin</option>
              <option value="StoreAdmin">Store Admin</option>
              <option value="User">User</option>
            </Select>
            {errors.role && (
              <p className="mt-1 text-sm text-error">{errors.role}</p>
            )}
          </div>

          {/* Terms Notice */}
          <div className="text-xs text-primary/70 dark:text-gray-300">
            By creating an account, you agree to our{" "}
            <Link
              href="/legal/terms"
              className="text-primary dark:text-secondary hover:underline font-medium transition-colors">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/legal/privacy"
              className="text-primary dark:text-secondary hover:underline font-medium transition-colors">
              Privacy Policy
            </Link>
            .
          </div>

          {/* Submit Button */}
          <Button type="submit" loading={loading} fullWidth className="mb-4 w-full">
            Create account
          </Button>

          {/* Divider
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-secondary/40 dark:border-primary/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 py-1 glass bg-gradient-to-r from-primary/5 via-secondary/10 to-primary/5 backdrop-blur-sm rounded-full text-primary/80 dark:text-gray-300 border border-secondary/20 dark:border-primary/20">
                or continue with
              </span>
            </div>
          </div>*/}

          {/* Google Button */}
          {/* <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={handleGoogleSignup}
            className="mb-6">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button> */}
        </form>

        {/* Login link */}
        <div className="text-center my-4">
          <p className="text-sm text-primary/80 dark:text-gray-300">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-primary dark:text-secondary font-semibold hover:underline transition-colors hover:text-primary/80 dark:hover:text-secondary/80">
              Log in
            </Link>
          </p>
        </div>
      </AuthCard>
    </main>
  );
}
