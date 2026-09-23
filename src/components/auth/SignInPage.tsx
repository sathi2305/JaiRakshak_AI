import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Droplets,
  Lock,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  Activity,
  Waves,
  Building2,
  CheckCircle2,
  Laptop,
  Smartphone,
  Shield,
  UserCheck,
  Cpu,
  Layers
} from 'lucide-react';

interface SignInPageProps {
  onOpenPwaModal?: (tab?: 'pc' | 'mobile') => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onOpenPwaModal }) => {
  const { loginWithGoogle, loginWithCredentials, openAppInstallModal } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultGoogleUser = {
    name: 'Sathiyamoorthi Saravanan',
    email: 'sathiyamoorthisaravanan2006@gmail.com'
  };

  const handleGoogleSignIn = async (roleOverride?: UserRole) => {
    setError(null);
    setGoogleLoading(true);
    const targetRole = roleOverride || selectedRole;
    try {
      await new Promise(r => setTimeout(r, 500));
      loginWithGoogle(defaultGoogleUser.email, defaultGoogleUser.name, undefined, targetRole);
    } catch (err: any) {
      setError(err?.message || 'Failed to authenticate with Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please enter your enterprise email address');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(r => setTimeout(r, 400));
      const extractedName = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      loginWithCredentials(email, password, selectedRole, extractedName || 'Enterprise Operator');
    } catch (err: any) {
      setError(err?.message || 'Authentication error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white relative overflow-hidden font-sans">
      
      {/* Dynamic Background Waves & Cyber Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-cyan-600/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-blue-700/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-sky-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Top Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white">
                JalRakshak<span className="text-cyan-400 ml-0.5">AI</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-cyan-950 text-cyan-400 border border-cyan-800/70 px-2 py-0.5 rounded-full">
                Enterprise IoT
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Predict Water Loss. Prevent Waste. Protect Tomorrow.
            </p>
          </div>
        </div>

        {/* Install Options: PC & Mobile */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenPwaModal ? onOpenPwaModal('mobile') : openAppInstallModal('mobile')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all cursor-pointer"
            title="Install JalRakshak on your Mobile Device"
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Mobile App</span>
          </button>

          <button
            onClick={() => onOpenPwaModal ? onOpenPwaModal('pc') : openAppInstallModal('pc')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all cursor-pointer"
            title="Install JalRakshak on your PC / Desktop"
          >
            <Laptop className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">PC App</span>
          </button>
        </div>
      </header>

      {/* Main Authentication Section */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Enterprise Water Portal
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Select your access authorization level to access the hydraulic digital twin
            </p>
          </div>

          {/* TWO LEVEL USER SELECTION TABS */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Select User Authorization Level:
            </label>
            <div className="grid grid-cols-2 gap-2.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
              
              {/* Admin Level Tab */}
              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all text-left cursor-pointer border ${
                  selectedRole === 'admin'
                    ? 'bg-cyan-950/60 border-cyan-500/80 text-white shadow-md shadow-cyan-900/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Shield className={`w-4 h-4 ${selectedRole === 'admin' ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="text-xs font-bold">Admin Level</span>
                </div>
                <span className="text-[10px] text-slate-400 text-center leading-tight">
                  Full control: simulation, valves &amp; thresholds
                </span>
              </button>

              {/* User Level Tab */}
              <button
                type="button"
                onClick={() => setSelectedRole('user')}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all text-left cursor-pointer border ${
                  selectedRole === 'user'
                    ? 'bg-blue-950/60 border-blue-500/80 text-white shadow-md shadow-blue-900/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <UserCheck className={`w-4 h-4 ${selectedRole === 'user' ? 'text-blue-400' : 'text-slate-500'}`} />
                  <span className="text-xs font-bold">User Level</span>
                </div>
                <span className="text-[10px] text-slate-400 text-center leading-tight">
                  Telemetry monitoring, copilot &amp; reports
                </span>
              </button>

            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/70 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* PRIMARY GOOGLE AUTHENTICATION BUTTON */}
          <div className="space-y-3">
            <button
              onClick={() => handleGoogleSignIn()}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs sm:text-sm shadow-lg transition-all cursor-pointer disabled:opacity-70 group"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{googleLoading ? 'Connecting to Google...' : `Continue with Google as ${selectedRole === 'admin' ? 'Admin' : 'User'}`}</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-800"></div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Or Work Email</span>
              <div className="flex-1 h-px bg-slate-800"></div>
            </div>
          </div>

          {/* EMAIL & PASSWORD FORM */}
          <form onSubmit={handleCredentialsSubmit} className="space-y-3.5">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Enterprise Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@jalrakshak.org"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-9 py-2 text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold text-xs shadow-md shadow-cyan-600/20 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              <span>{isLoading ? 'Verifying Credentials...' : `Sign In as ${selectedRole === 'admin' ? 'Admin Level' : 'User Level'}`}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Switchers */}
          <div className="pt-2 border-t border-slate-800/80 text-center space-y-2">
            <span className="text-[11px] text-slate-400 block font-medium">Quick One-Click Demo Access:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleGoogleSignIn('admin')}
                className="py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                Log in as Admin
              </button>
              <button
                type="button"
                onClick={() => handleGoogleSignIn('user')}
                className="py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-blue-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                Log in as User
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 border-t border-slate-800/80">
        <p>© 2026 JalRakshak AI — Municipal &amp; Institutional IoT Water Intelligence</p>
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <span>ISO 14046 Compliant</span>
          <span>•</span>
          <span>EPANET 2.2 Fluid Dynamics</span>
        </div>
      </footer>

    </div>
  );
};
