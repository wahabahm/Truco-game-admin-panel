import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      const result = await authService.register(name, email, password);
      
      if (result.success) {
        toast.success('Registration successful! Please verify your email.');
        // Redirect to verify email page
        navigate('/verify-email', { 
          state: { email },
          replace: true 
        });
      } else {
        toast.error(result.message || 'Registration failed');
      }
    } catch (error) {
      toast.error('An error occurred during registration');
      logger.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Game-themed background patterns */}
      <div className="fixed inset-0 game-grid-bg opacity-20 -z-10" />
      <div className="fixed inset-0 particle-bg -z-10" />
      
      {/* Animated background gradients */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-500" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-pulse delay-700" />
      
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-2 border-primary/40 bg-card/95 backdrop-blur-md game-card animate-scale-in neon-border">
        <CardHeader className="space-y-1 flex flex-col items-center pb-8 pt-10">
          <div className="relative mb-2">
            <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full animate-pulse-glow"></div>
            <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300 ring-4 ring-primary/30 float">
              <UserPlus className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mt-6 tracking-tight">
            Create Account
          </CardTitle>
          <CardDescription className="text-center text-sm sm:text-base mt-2 text-muted-foreground">
            Register as a new player and get 100 coins free!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 sm:h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 text-sm"
                autoComplete="name"
                placeholder="Enter your full name"
                required
                minLength={2}
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 sm:h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 text-sm"
                autoComplete="email"
                placeholder="Enter your email address"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 sm:h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 text-sm"
                autoComplete="new-password"
                placeholder="Enter password (min 6 characters)"
                required
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters long
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-10 sm:h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 text-sm"
                autoComplete="new-password"
                placeholder="Confirm your password"
                required
                minLength={6}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-11 sm:h-12 bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 shadow-xl hover:shadow-2xl font-bold text-sm sm:text-base neon-glow hover:scale-105" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Registering...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
            <div className="text-center text-sm text-muted-foreground mt-4">
              Already have an account?{' '}
              <Link 
                to="/" 
                className="text-primary hover:text-primary/80 font-semibold underline underline-offset-4 transition-colors"
              >
                Sign In
              </Link>
            </div>
            <div className="text-xs text-center text-muted-foreground mt-4 p-4 bg-muted/30 rounded-xl border border-border/50">
              <p className="font-semibold text-foreground mb-1">🎁 Welcome Bonus!</p>
              <p>New players receive 100 coins upon registration</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;

