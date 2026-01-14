import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  username?: string;
  displayName?: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    displayName: '',
    isChild: false,
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const validateForm = () => {
    const errors: FormErrors = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.displayName) {
      errors.displayName = 'Display name is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) return;

    try {
      await register({
        email: formData.email,
        password: formData.password,
        username: formData.username,
        displayName: formData.displayName,
        isChild: formData.isChild,
      });
      navigate('/dashboard');
    } catch {
      // Error is handled by the store
    }
  };

  return (
    <Card className="animate-in">
      <CardContent>
        <div className="text-center mb-6">
          <h2 className="font-display font-bold text-2xl text-gray-900">Join DuoPlay!</h2>
          <p className="text-gray-500 mt-1">Create your account to start playing</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          <Input
            label="Display Name"
            name="displayName"
            placeholder="How should we call you?"
            value={formData.displayName}
            onChange={handleChange}
            error={formErrors.displayName}
          />

          <Input
            label="Username"
            name="username"
            placeholder="Choose a unique username"
            value={formData.username}
            onChange={handleChange}
            error={formErrors.username}
            helperText="Letters, numbers, and underscores only"
          />

          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
            error={formErrors.email}
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            error={formErrors.password}
            autoComplete="new-password"
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={formErrors.confirmPassword}
            autoComplete="new-password"
          />

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              name="isChild"
              checked={formData.isChild}
              onChange={handleChange}
              className="w-5 h-5 rounded border-gray-300 text-coral-500 focus:ring-coral-500"
            />
            <span className="text-sm text-gray-700">This is a child account</span>
          </label>

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-coral-500 hover:text-coral-600 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
