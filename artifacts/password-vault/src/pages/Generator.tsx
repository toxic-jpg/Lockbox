import React, { useState, useEffect } from 'react';
import { generatePassword, generatePassphrase, generatePin, generateApiKey, getStrength, CHARSETS } from '@/lib/crypto';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, RefreshCw, Save, ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function Generator() {
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState<{score: number, crackTime: string}>({ score: 0, crackTime: '' });
  
  // Options
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  
  // Passphrase options
  const [wordCount, setWordCount] = useState(4);
  const [separator, setSeparator] = useState('-');
  const [capitalize, setCapitalize] = useState(true);

  // Mode
  const [mode, setMode] = useState('password');

  const generate = () => {
    let result = '';
    if (mode === 'password') {
      // Force at least one selection
      if (!uppercase && !lowercase && !numbers && !symbols) {
        setLowercase(true);
        setNumbers(true);
      }
      result = generatePassword({
        length, uppercase, lowercase, numbers, symbols, excludeSimilar, excludeAmbiguous
      });
    } else if (mode === 'passphrase') {
      result = generatePassphrase(wordCount, separator, capitalize);
    } else if (mode === 'pin') {
      result = generatePin(length);
    } else if (mode === 'apikey') {
      result = generateApiKey();
    }
    
    setPassword(result);
    if (mode !== 'pin' && mode !== 'apikey') {
      setStrength(getStrength(result));
    } else {
      setStrength({ score: mode === 'apikey' ? 4 : 1, crackTime: mode === 'apikey' ? 'centuries' : 'seconds' });
    }
  };

  // Initial gen
  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, length, uppercase, lowercase, numbers, symbols, excludeSimilar, excludeAmbiguous, wordCount, separator, capitalize]);

  const handleCopy = () => {
    copyToClipboard(password, () => toast.success('Copied to clipboard'));
  };

  const getStrengthColor = (score: number) => {
    if (score === 0 || score === 1) return 'bg-destructive';
    if (score === 2) return 'bg-orange-500';
    if (score === 3) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  const getStrengthLabel = (score: number) => {
    if (score === 0 || score === 1) return 'Weak';
    if (score === 2) return 'Fair';
    if (score === 3) return 'Good';
    return 'Strong';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Top Section - Display */}
      <div className="bg-card rounded-2xl border p-8 shadow-sm flex flex-col items-center relative overflow-hidden">
        {/* Ambient background glow based on strength */}
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-5 blur-3xl transition-colors duration-1000 ${getStrengthColor(strength.score).replace('bg-', '')}`}
          style={{ backgroundColor: `hsl(var(--${getStrengthColor(strength.score).replace('bg-', '')}))` }} 
        />
        
        <h1 className="text-sm uppercase tracking-widest font-semibold text-muted-foreground mb-6 z-10">
          Generated {mode}
        </h1>

        <div className="w-full relative z-10 flex flex-col items-center mb-8">
          <AnimatePresence mode="popLayout">
            <motion.div 
              key={password}
              initial={{ y: 20, opacity: 0, filter: 'blur(10px)' }}
              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              exit={{ y: -20, opacity: 0, filter: 'blur(10px)' }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="text-center"
            >
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-mono tracking-tight font-medium break-all px-4 selection:bg-primary/30">
                {password}
              </h2>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex gap-4 z-10">
          <Button size="lg" variant="outline" onClick={generate} className="group">
            <RefreshCw className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" /> Regenerate
          </Button>
          <Button size="lg" onClick={handleCopy} className="bg-primary text-primary-foreground">
            <Copy className="w-5 h-5 mr-2" /> Copy to Clipboard
          </Button>
        </div>

        {/* Strength Meter */}
        <div className="w-full max-w-md mt-10 space-y-3 z-10">
          <div className="flex justify-between items-center text-sm font-medium">
            <span className="text-muted-foreground flex items-center gap-2">
              {strength.score >= 3 ? <ShieldCheck className="w-4 h-4 text-emerald-500" /> : <ShieldAlert className="w-4 h-4 text-orange-500" />}
              Strength: {getStrengthLabel(strength.score)}
            </span>
            <span className="text-muted-foreground">Crack time: {strength.crackTime}</span>
          </div>
          <div className="flex gap-1 h-2">
            {[0, 1, 2, 3].map(i => (
              <div 
                key={i} 
                className={`flex-1 rounded-full transition-all duration-500 ${
                  i <= strength.score ? getStrengthColor(strength.score) : 'bg-muted'
                }`} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <Tabs defaultValue="password" value={mode} onValueChange={setMode} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card border p-1 rounded-xl h-14">
          <TabsTrigger value="password" className="rounded-lg">Password</TabsTrigger>
          <TabsTrigger value="passphrase" className="rounded-lg">Passphrase</TabsTrigger>
          <TabsTrigger value="pin" className="rounded-lg">PIN Code</TabsTrigger>
          <TabsTrigger value="apikey" className="rounded-lg">API Key</TabsTrigger>
        </TabsList>

        <div className="mt-6 bg-card border rounded-2xl p-6 shadow-sm">
          
          <TabsContent value="password" className="m-0 space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Length</Label>
                <span className="font-mono bg-muted px-2 py-1 rounded text-sm">{length}</span>
              </div>
              <Slider 
                value={[length]} 
                onValueChange={(v) => setLength(v[0])} 
                max={64} 
                min={8} 
                step={1} 
                className="py-4"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <div className="space-y-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Characters</h3>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="uppercase" className="cursor-pointer">Uppercase (A-Z)</Label>
                  <Switch id="uppercase" checked={uppercase} onCheckedChange={setUppercase} />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="lowercase" className="cursor-pointer">Lowercase (a-z)</Label>
                  <Switch id="lowercase" checked={lowercase} onCheckedChange={setLowercase} />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="numbers" className="cursor-pointer">Numbers (0-9)</Label>
                  <Switch id="numbers" checked={numbers} onCheckedChange={setNumbers} />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="symbols" className="cursor-pointer flex items-center gap-2">
                    Symbols 
                    <span className="text-xs text-muted-foreground font-mono">!@#$</span>
                  </Label>
                  <Switch id="symbols" checked={symbols} onCheckedChange={setSymbols} />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Rules</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="similar" className="cursor-pointer">Exclude Similar</Label>
                    <p className="text-xs text-muted-foreground font-mono">i, l, 1, L, o, 0, O</p>
                  </div>
                  <Switch id="similar" checked={excludeSimilar} onCheckedChange={setExcludeSimilar} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ambiguous" className="cursor-pointer">Exclude Ambiguous</Label>
                    <p className="text-xs text-muted-foreground font-mono">{`{} [] () / \\ ' " \` ~ , ; : . < >`}</p>
                  </div>
                  <Switch id="ambiguous" checked={excludeAmbiguous} onCheckedChange={setExcludeAmbiguous} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="passphrase" className="m-0 space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Word Count</Label>
                <span className="font-mono bg-muted px-2 py-1 rounded text-sm">{wordCount}</span>
              </div>
              <Slider 
                value={[wordCount]} 
                onValueChange={(v) => setWordCount(v[0])} 
                max={12} 
                min={3} 
                step={1} 
                className="py-4"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label>Separator</Label>
                <div className="flex gap-2">
                  {['-', '_', '.', ',', ' ', 'none'].map(sep => (
                    <Button 
                      key={sep}
                      type="button"
                      variant={separator === (sep === 'none' ? '' : sep) ? 'default' : 'outline'}
                      onClick={() => setSeparator(sep === 'none' ? '' : sep)}
                      className="font-mono w-10 h-10 p-0"
                    >
                      {sep === 'none' ? 'Ø' : sep === ' ' ? 'SPC' : sep}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4 flex flex-col justify-center">
                <div className="flex items-center justify-between">
                  <Label htmlFor="capitalize" className="cursor-pointer">Capitalize Words</Label>
                  <Switch id="capitalize" checked={capitalize} onCheckedChange={setCapitalize} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pin" className="m-0 space-y-8">
             <div className="space-y-4 max-w-md mx-auto">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">PIN Length</Label>
                <span className="font-mono bg-muted px-2 py-1 rounded text-sm">{length}</span>
              </div>
              <Slider 
                value={[length]} 
                onValueChange={(v) => setLength(v[0])} 
                max={12} 
                min={4} 
                step={1} 
                className="py-4"
              />
            </div>
          </TabsContent>

          <TabsContent value="apikey" className="m-0 text-center py-8">
             <div className="text-muted-foreground flex flex-col items-center">
               <Shield className="w-12 h-12 mb-4 opacity-50 text-primary" />
               <p>Generates a 64-character (32-byte) hex-encoded cryptographically secure random API key.</p>
             </div>
          </TabsContent>

        </div>
      </Tabs>

    </div>
  );
}
