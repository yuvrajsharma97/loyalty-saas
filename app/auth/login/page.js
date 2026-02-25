"use client";
import { useState, useEffect, Suspense } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import PasswordField from "@/components/ui/PasswordField";
import Select from "@/components/ui/Select";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const message = searchParams.get("message");
    if (message) {
      setSuccessMessage(message);
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors = {};


    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }


    if (!formData.password) {
      newErrors.password = "Password is required";
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
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          role: formData.role,
          redirect: false
        });

        if (result?.error) {
          setErrors({ general: result.error });
        } else {

          const session = await getSession();

          if (session?.user?.role === "SuperAdmin") {
            router.push("/admin/dashboard");
          } else if (session?.user?.role === "StoreAdmin") {
            router.push("/store/dashboard");
          } else {
            router.push("/user/dashboard");
          }
        }
      } catch (error) {
        console.error("Login error:", error);
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

  const handleGoogleLogin = () => {
    console.log("Google login clicked (placeholder)");
  };

  return (
    <main>
      <AuthCard title="Welcome back" subtitle="Log in to continue">
        <form onSubmit={handleSubmit} className="space-y-6">
          {}
          {successMessage &&
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-sm text-green-600 dark:text-green-400">
              {successMessage}
            </div>
          }

          {}
          {errors.general &&
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-400">
              {errors.general}
            </div>
          }

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
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange("password")}
            error={errors.password}
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
          <div className="text-right">
            <Link
              href="/auth/forgot-password"
              className="text-sm hover:underline hover:text-text-secondary font-medium underline">
              Forgot your password?
            </Link>
          </div>

          {}
          <Button
            type="submit"
            loading={loading}
            fullWidth
            className="mb-4 w-full">
            Log in
          </Button>

          {









          }

          {}
          {
























          }
        </form>

        {}
        <div className="text-center my-4">
          <p className="text-sm ">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="font-semibold underline hover:text-text-secondary">
              Create an account
            </Link>
          </p>
        </div>
      </AuthCard>
    </main>);

}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>);

}