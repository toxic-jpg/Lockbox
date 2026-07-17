import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-[100dvh] w-full bg-background text-foreground overflow-hidden font-sans">
      <Sidebar className="hidden md:flex flex-shrink-0" />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 relative">
          <div className="mx-auto max-w-6xl w-full pb-20">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
