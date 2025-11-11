import { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background relative overflow-hidden">
        {/* Game-themed background pattern */}
        <div className="fixed inset-0 game-grid-bg opacity-30 -z-10" />
        <div className="fixed inset-0 particle-bg -z-10" />
        
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="min-h-screen relative">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};
