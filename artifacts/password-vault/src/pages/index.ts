import React from 'react';
import Dashboard from '@/pages/Dashboard';
import Vault from '@/pages/Vault';
import Generator from '@/pages/Generator';
import { Content } from 'vaul';

// Placeholders for routes to be built
const Settings = () => <div className="p-8">Settings Content</div>;
const NotFound = () => <div className="p-8 text-destructive">404 - Not Found</div>;

// We export the components to be used in App.tsx
export { Dashboard, Vault, Generator, Settings, NotFound };