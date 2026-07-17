import React, { useState, useEffect } from 'react';
import { useAppState } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldCheck, ArrowRight, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LockScreen() {
  const { setIsUnlocked } = useAppState();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [hasPin, setHasPin] = useState(true);
  const [isSettingPin, setIsSettingPin] = useState(false);

  useEffect(() => {
    // Check if PIN exists in localStorage
    const savedPin = localStorage.getItem('vault-pin');
    if (!savedPin) {
      setHasPin(false);
      setIsSettingPin(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) return;

    if (isSettingPin) {
      // In a real app this should be hashed, but keeping simple for MVP
      localStorage.setItem('vault-pin', btoa(pin));
      setIsSettingPin(false);
      setHasPin(true);
      setPin('');
    } else {
      const savedPin = localStorage.getItem('vault-pin');
      if (btoa(pin) === savedPin) {
        setIsUnlocked(true);
      } else {
        setError(true);
        setPin('');
        setTimeout(() => setError(false), 1000);
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
          className="relative z-10 w-full max-w-md p-8 flex flex-col items-center"
        >
          <div className="w-20 h-20 bg-card rounded-2xl shadow-xl border border-white/5 flex items-center justify-center mb-8 relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            {isSettingPin ? (
              <ShieldCheck className="w-10 h-10 text-primary relative z-10" />
            ) : (
              <Lock className="w-10 h-10 text-primary relative z-10" />
            )}
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2 font-mono">
              {isSettingPin ? 'Setup Vault' : 'Vault Locked'}
            </h1>
            <p className="text-muted-foreground">
              {isSettingPin 
                ? 'Create a master PIN to secure your local vault.' 
                : 'Enter your master PIN to access your credentials.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-6">
            <div className="space-y-2 relative">
              <div className="relative">
                <Input
                  type="password"
                  placeholder={isSettingPin ? 'Create PIN' : 'Enter PIN'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className={`h-14 text-center text-2xl tracking-[0.5em] font-mono bg-card/50 border-white/10 focus-visible:ring-primary ${error ? 'border-destructive focus-visible:ring-destructive text-destructive animate-shake' : ''}`}
                  autoFocus
                />
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground opacity-50" />
              </div>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-destructive text-sm text-center font-medium absolute -bottom-6 left-0 right-0"
                >
                  Incorrect PIN
                </motion.p>
              )}
            </div>

            <Button type="submit" size="lg" className="w-full h-14 text-lg font-medium group">
              {isSettingPin ? 'Set PIN' : 'Unlock Vault'}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
