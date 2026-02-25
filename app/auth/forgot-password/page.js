'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import AuthCard from '@/components/auth/AuthCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    setError(emailError);

    if (!emailError) {
      setLoading(true);


      console.log('Forgot password for email:', email);


      setTimeout(() => {
        setLoading(false);
        setSubmitted(true);
        setResendCountdown(30);
      }, 1500);
    }
  };

  const handleResend = () => {
    if (resendCountdown > 0) return;

    console.log('Resend reset link for email:', email);
    setResendCountdown(30);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };


  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCountdown]);

  return (
    <main>
      <AuthCard
        title="Forgot your password?"
        subtitle="We'll send you a reset link.">
        
        {}
        {submitted &&
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl" role="alert" aria-live="polite">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                  Check your email
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  If an account exists for <strong>{email}</strong>, we've sent a reset link.
                </p>
              </div>
            </div>
          </div>
        }

        <form onSubmit={handleSubmit} className="space-y-6">
          {}
          <div>
            <Label htmlFor="email" required>
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={handleEmailChange}
              error={error}
              disabled={submitted}
              autoComplete="email"
              autoFocus />
            
            {!error &&
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                We'll never share your email.
              </p>
            }
          </div>

          {}
          <Button
            type="submit"
            loading={loading}
            fullWidth
            disabled={submitted}
            className="mb-4">
            
            <Mail className="w-4 h-4 mr-2" />
            Send reset link
          </Button>
        </form>

        {}
        {submitted &&
        <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Didn't receive the email? Check your spam folder.
            </p>
            <Button
            type="button"
            variant="ghost"
            onClick={handleResend}
            disabled={resendCountdown > 0}
            className="text-sm">
            
              {resendCountdown > 0 ? `Resend link (${resendCountdown}s)` : 'Resend link'}
            </Button>
          </div>
        }

        {}
        <div className="mt-8 pt-6 border-t border-[#D0D8C3]/30 dark:border-zinc-600">
          <div className="flex flex-col sm:flex-row gap-4 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center text-sm text-[#014421] dark:text-[#D0D8C3] hover:underline">
              
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to login
            </Link>
            <span className="hidden sm:block text-gray-300 dark:text-gray-600">•</span>
            <Link
              href="/auth/register"
              className="text-sm text-[#014421] dark:text-[#D0D8C3] hover:underline">
              
              Create an account
            </Link>
          </div>
        </div>
      </AuthCard>
    </main>);

}