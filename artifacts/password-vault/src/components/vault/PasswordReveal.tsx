import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Copy } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PasswordRevealProps {
  password?: string;
  onReveal?: () => void;
}

export function PasswordReveal({ password, onReveal }: PasswordRevealProps) {
  const [revealed, setRevealed] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (revealed && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(c => c - 1);
      }, 1000);
    } else if (revealed && countdown === 0) {
      setRevealed(false);
    }
    return () => clearTimeout(timer);
  }, [revealed, countdown]);

  const handleReveal = () => {
    if (!password) return;
    if (!revealed) {
      setRevealed(true);
      setCountdown(10);
      onReveal?.();
    } else {
      setRevealed(false);
      setCountdown(0);
    }
  };

  const handleCopy = () => {
    if (password) {
      copyToClipboard(password, () => toast.success('Password copied'));
    }
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="relative flex-1">
        <Input
          type={revealed ? "text" : "password"}
          value={password || ''}
          readOnly
          className="pr-12 font-mono tracking-wider bg-muted/50 focus-visible:ring-0"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {revealed && <span className="text-xs text-primary font-mono w-4 text-center">{countdown}</span>}
          <button 
            type="button"
            onClick={handleReveal}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-md transition-colors"
            disabled={!password}
          >
            {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <Button 
        type="button"
        variant="secondary" 
        size="icon"
        onClick={handleCopy}
        disabled={!password}
        className="flex-shrink-0"
      >
        <Copy className="w-4 h-4" />
      </Button>
    </div>
  );
}
