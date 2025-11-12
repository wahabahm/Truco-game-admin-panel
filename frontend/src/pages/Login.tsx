import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        toast.error('Invalid credentials');
      }
    } catch (error) {
      toast.error('An error occurred during login');
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
              <Trophy className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mt-6 tracking-tight">
            Truco Admin Panel
          </CardTitle>
          <CardDescription className="text-center text-sm sm:text-base mt-2 text-muted-foreground">
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@truco.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 sm:h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 text-sm"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 sm:h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 text-sm"
                autoComplete="current-password"
                required
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
                  Logging in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
            {import.meta.env.DEV && (
              <div className="text-xs text-center text-muted-foreground mt-4 p-4 bg-muted/30 rounded-xl border border-border/50">
                <strong className="text-foreground">Demo credentials (dev only):</strong>
                <div className="mt-2 space-y-1">
                  <div className="font-mono text-sm">admin@truco.com</div>
                  <div className="font-mono text-sm">admin123</div>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
