import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { AppStateProvider, useAppState } from '@/lib/store';
import { AppShell } from '@/components/layout/AppShell';
import LockScreen from '@/pages/LockScreen';

import Dashboard from '@/pages/Dashboard';
import Vault from '@/pages/Vault';
import Generator from '@/pages/Generator';
// Placeholders
const Settings = () => <div className="p-8">Settings Content</div>;
const NotFound = () => <div className="p-8 text-destructive">404 - Not Found</div>;

const queryClient = new QueryClient();

function ProtectedApp() {
  const { isUnlocked } = useAppState();

  if (!isUnlocked) {
    return <LockScreen />;
  }

  return (
    <AppShell>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/vault" component={Vault} />
        <Route path="/generator" component={Generator} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppStateProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <ProtectedApp />
          </WouterRouter>
          <Toaster />
        </AppStateProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
