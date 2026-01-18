import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, ArrowLeft } from 'lucide-react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth as firebaseAuth } from '../firebase'; // Ensure this points to your firebase config
import { useAuthStore } from '../store/authStore';
import { profile } from '../api'; // Your existing profile API wrapper
import { useToastStore } from '../components/ui/Toast';

export function AuthPage() {
  // UI State
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { addToast } = useToastStore();

  // Logic: Check if profile is filled out after login
  const handlePostLogin = async (user: any) => {
    try {
      const profileData = await profile.get();
      const currentUserEmail = user.email;

      const isProfileEmpty = !profileData.name && !profileData.email && profileData.education.length === 0;
      const profileComplete = profileData.name.trim() !== '' &&
          profileData.email.trim() !== '' &&
          profileData.education.length > 0 &&
          profileData.email === currentUserEmail;

      if (isProfileEmpty || !profileComplete) {
        navigate('/profile');
      } else {
        navigate('/fyp');
      }
    } catch (error) {
      // If profile fetch fails or doesn't exist, send to profile creation
      navigate('/profile');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN LOGIC ---
        const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
        const idToken = await userCredential.user.getIdToken();

        // Exchange Firebase ID token with backend to get backend user
        const res = await fetch('http://localhost:8000/api/auth/login/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userCredential.user.email, id_token: idToken }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Backend login failed');
        }

        const backendUser = data.user;
        const token = data.token || idToken;
        const frontendUser = {
          id: String(backendUser.id),
          name: backendUser.username || `${backendUser.first_name || ''} ${backendUser.last_name || ''}`.trim(),
          email: backendUser.email,
        };

        // Update Store
        setAuth(frontendUser, token);
        addToast('Logged in successfully', 'success');

        // Check profile status
        await handlePostLogin(frontendUser);

      } else {
        // --- REGISTER LOGIC ---
        // 1. Create User in Firebase
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        const idToken = await userCredential.user.getIdToken();

        // 2. Create User in Django Backend
        const response = await fetch('http://localhost:8000/api/auth/register/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            username,
            first_name: firstName,
            last_name: lastName,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Backend registration failed');
        }

        const backendUser = data.user;
        const token = idToken;
        const frontendUser = {
          id: String(backendUser.id),
          name: backendUser.username || `${backendUser.first_name || ''} ${backendUser.last_name || ''}`.trim(),
          email: backendUser.email,
        };

        // 3. Success
        setAuth(frontendUser, token);
        addToast('Account created successfully', 'success');
        navigate('/profile'); // Send new users directly to profile setup
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const errorMessage = err.message || 'Authentication failed';
      addToast(errorMessage.replace('Firebase: ', ''), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // Use Firebase Auth popup for Google sign-in
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(firebaseAuth, provider);
      const idToken = await userCredential.user.getIdToken();

      // Exchange Firebase ID token with backend to get backend user
      const res = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userCredential.user.email, id_token: idToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Backend login failed');
      }

      const backendUser = data.user;
      const token = data.token || idToken;
      const frontendUser = {
        id: String(backendUser.id),
        name: backendUser.username || `${backendUser.first_name || ''} ${backendUser.last_name || ''}`.trim(),
        email: backendUser.email,
      };

      setAuth(frontendUser, token);
      addToast('Logged in with Google', 'success');
      await handlePostLogin(frontendUser);
    } catch (err: any) {
      console.error('Google login error:', err);
      addToast('Failed to login with Google', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    // Clear errors or reset specific fields if needed
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-lg shadow-xl p-8">
            <h1 className="text-3xl font-bold text-center mb-8">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4 mb-6">

              {/* Registration Fields */}
              {!isLogin && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Username</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required={!isLogin}
                            className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="jdoe123"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">First Name</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full px-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Last Name</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full px-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Doe"
                        />
                      </div>
                    </div>
                  </>
              )}

              {/* Standard Credentials */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {loading
                    ? (isLogin ? 'Signing in...' : 'Creating account...')
                    : (isLogin ? 'Sign In' : 'Create Account')
                }
              </button>
            </form>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">Or</span>
              </div>
            </div>

            <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full border border-border py-2 rounded-md font-medium hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <div className="mt-6 text-center">
              <button
                  onClick={toggleMode}
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                {isLogin ? (
                    <>Create account <ArrowRight size={14} /></>
                ) : (
                    <><ArrowLeft size={14} /> Back to login</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}
