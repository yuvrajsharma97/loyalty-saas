"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";
import AuthCard from "@/components/auth/AuthCard";
import Button from "@/components/ui/Button";
import PasswordField from "@/components/ui/PasswordField";

export default function ResetPasswordPage() {
  const params = useParams();
  const token = params?.token;

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Validate token
  const isValidToken = token && typeof token === "string" && token.length >= 8;

  const validateForm = () => {
    const newErrors = {};

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

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidToken) return;

    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);

      // Simulate API call
      console.log("Reset password with token:", {
        token: token,
        newPassword: "***hidden***",
      });

      // Simulate delay
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
      }, 1500);
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

  return (
    <main>
      <AuthCard
        title="Reset your password"
        subtitle="Choose a new password to secure your account.">
        {/* Invalid Token Error */}
        {!isValidToken && (
          <div
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
            role="alert">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Invalid reset link
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  This password reset link is invalid or has expired. Please
                  request a new one.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/auth/forgot-password">
                <Button variant="secondary" size="sm">
                  Request new reset link
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Success State */}
        {success && (
          <div
            className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl"
            role="alert"
            aria-live="polite">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                  Password updated successfully
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Your password has been reset. You can now log in with your new
                  password.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/auth/login">
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <ArrowRight className="w-4 h-4 mr-1" />
                  Go to login
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Form */}
        {isValidToken && !success && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Token Info */}
            <div className="text-center mb-6">
              <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800 px-3 py-2 rounded-lg inline-block">
                Reset token: {token.substring(0, 8)}...
              </p>
            </div>

            {/* New Password Field */}
            <PasswordField
              id="password"
              label="New password"
              placeholder="Enter your new password"
              value={formData.password}
              onChange={handleChange("password")}
              error={errors.password}
              required
              showHint={true}
            />

            {/* Confirm Password Field */}
            <PasswordField
              id="confirmPassword"
              label="Confirm new password"
              placeholder="Confirm your new password"
              value={formData.confirmPassword}
              onChange={handleChange("confirmPassword")}
              error={errors.confirmPassword}
              required
            />

            {/* Submit Button */}
            <Button type="submit" loading={loading} fullWidth className="mb-4">
              Update password
            </Button>
          </form>
        )}

        {/* Back to Login Link */}
        {!success && (
          <div className="mt-8 pt-6 border-t border-[#D0D8C3]/30 dark:border-zinc-600 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center text-sm text-[#014421] dark:text-[#D0D8C3] hover:underline">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to login
            </Link>
          </div>
        )}
      </AuthCard>
    </main>
  );
}
