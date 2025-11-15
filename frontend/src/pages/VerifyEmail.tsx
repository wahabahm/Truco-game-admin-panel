import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/authService';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  const handleVerify = async (verifyToken?: string) => {
    const tokenToVerify = verifyToken || token;
    if (!tokenToVerify) {
      setVerificationError('Please enter a verification token');
      return;
    }

    setIsVerifying(true);
    setVerificationError('');

    try {
      const result = await authService.verifyEmail(tokenToVerify);
      if (result.success) {
        setIsVerified(true);
        toast.success(result.message || 'Email verified successfully!');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setVerificationError(result.message || 'Verification failed');
        toast.error(result.message || 'Verification failed');
      }
    } catch (error) {
      setVerificationError('An error occurred during verification');
      toast.error('An error occurred during verification');
    } finally {
      setIsVerifying(false);
    }
  };

  // Get token from URL query params
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      handleVerify(tokenFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleResend = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsResending(true);
    try {
      const result = await authService.resendVerification(email);
      if (result.success) {
        toast.success(result.message || 'Verification email sent!');
        
        // In development, show token and link
        if (import.meta.env.DEV && result.token) {
          console.log('Verification Token:', result.token);
          console.log('Verification Link:', result.verificationLink);
          toast.info('Check console for verification token (dev only)');
        }
      } else {
        toast.error(result.message || 'Failed to resend verification email');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background patterns */}
      <div className="fixed inset-0 game-grid-bg opacity-20 -z-10" />
      <div className="fixed inset-0 particle-bg -z-10" />
      
      {/* Animated background gradients */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-500" />
      
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-2 border-primary/40 bg-card/95 backdrop-blur-md game-card animate-scale-in neon-border">
        <CardHeader className="space-y-1 flex flex-col items-center pb-8 pt-10">
          <div className="relative mb-2">
            <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full animate-pulse-glow"></div>
            <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300 ring-4 ring-primary/30 float">
              {isVerified ? (
                <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              ) : (
                <Mail className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              )}
            </div>
          </div>
          <CardTitle className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mt-6 tracking-tight">
            {isVerified ? 'Email Verified!' : 'Verify Email'}
          </CardTitle>
          <CardDescription className="text-center text-sm sm:text-base mt-2 text-muted-foreground">
            {isVerified 
              ? 'Your email has been successfully verified. Redirecting to login...'
              : 'Enter your verification token or email to resend verification'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isVerified ? (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle2 className="h-16 w-16 text-green-500 mb-4 animate-scale-in" />
              <p className="text-center text-muted-foreground">
                Your email has been verified successfully!
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Verify Token Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="token" className="text-sm font-medium">Verification Token</Label>
                  <Input
                    id="token"
                    type="text"
                    placeholder="Enter verification token from email"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="h-10 sm:h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 text-sm"
                    disabled={isVerifying}
                  />
                  {verificationError && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <XCircle className="h-4 w-4" />
                      <span>{verificationError}</span>
                    </div>
                  )}
                </div>
                <Button 
                  type="button"
                  onClick={() => handleVerify()}
                  className="w-full h-11 sm:h-12 bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 shadow-xl hover:shadow-2xl font-bold text-sm sm:text-base neon-glow hover:scale-105" 
                  disabled={isVerifying || !token}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Email'
                  )}
                </Button>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              {/* Resend Verification Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Resend Verification Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 sm:h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 text-sm"
                    disabled={isResending}
                  />
                </div>
                <Button 
                  type="button"
                  onClick={handleResend}
                  variant="outline"
                  className="w-full h-11 sm:h-12 transition-all duration-300 font-bold text-sm sm:text-base hover:scale-105" 
                  disabled={isResending || !email}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Resend Verification Email'
                  )}
                </Button>
              </div>

              {/* Back to Login */}
              <div className="text-center pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/')}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Back to Login
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;

