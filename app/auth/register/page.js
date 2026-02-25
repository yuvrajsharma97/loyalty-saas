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
    role: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};


    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }


    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }


    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }


    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }


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
      setErrors({});

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role
          })
        });

        const data = await response.json();

        if (data.ok) {

          router.push("/auth/login?message=Registration successful. Please log in.");
        } else {

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
      [field]: e.target.value
    }));


    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: ""
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
          {}
          {errors.general &&
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-400">
              {errors.general}
            </div>
          }

          {}
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
              autoComplete="name" />
            
          </div>

          {}
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
              autoComplete="email" />
            
          </div>

          {}
          <PasswordField
            id="password"
            label="Password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange("password")}
            error={errors.password}
            required
            showHint={true} />
          

          {}
          <PasswordField
            id="confirmPassword"
            label="Confirm password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange("confirmPassword")}
            error={errors.confirmPassword}
            required />
          

          {}
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
            {errors.role &&
            <p className="mt-1 text-sm text-error">{errors.role}</p>
            }
          </div>

          {}
          <div className="text-xs">
            By creating an account, you agree to our{" "}
            <Link
              href="/legal/terms"
              className="hover:underline hover:text-text-secondary font-medium">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/legal/privacy"
              className="hover:underline hover:text-text-secondary font-medium">
              Privacy Policy
            </Link>
            .
          </div>

          {}
          <Button
            type="submit"
            loading={loading}
            fullWidth
            className="mb-4 w-full">
            Create account
          </Button>

          {









          }

          {}
          {
























          }
        </form>

        {}
        <div className="text-center my-4">
          <p className="text-sm dark:text-gray-300">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className=" font-semibold hover:underline hover:text-text-secondary">
              Log in
            </Link>
          </p>
        </div>
      </AuthCard>
    </main>);

}