import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { HiOutlineLightningBolt, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export default function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { register: authRegister, loading } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    const result = await authRegister(data.name, data.email, data.password, data.role);
    if (result.success) {
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <HiOutlineLightningBolt className="text-primary text-3xl" />
          </div>
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-primary to-cyan bg-clip-text text-transparent">SmartRoute</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Create your account</p>
        </div>

        <div className="glass-panel p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Sign Up</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="register-name" className="block text-sm font-medium text-gray-400 mb-1.5">Full Name</label>
              <input
                id="register-name"
                name="name"
                type="text"
                autoComplete="name"
                {...register('name', { required: 'Name is required' })}
                className="input-field w-full"
                placeholder="John Doe"
              />
              {errors.name && <p className="text-danger text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
              <input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                className="input-field w-full"
                placeholder="john@smartroute.com"
              />
              {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="register-role" className="block text-sm font-medium text-gray-400 mb-1.5">Role</label>
              <select
                id="register-role"
                name="role"
                {...register('role')}
                className="input-field w-full"
                defaultValue="dispatcher"
              >
                <option value="admin">Admin</option>
                <option value="dispatcher">Dispatcher</option>
                <option value="manager">Manager</option>
                <option value="driver">Driver</option>
              </select>
            </div>

            <div>
              <label htmlFor="register-password" className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                  className="input-field w-full pr-10"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  {showPassword ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary justify-center py-3 text-base font-semibold disabled:opacity-50">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-primary-light transition">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
