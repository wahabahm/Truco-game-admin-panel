import { ReactNode } from 'react';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppLayoutProps {
  children: ReactNode;
}

const MobileMenuButton = () => {
  const { setOpenMobile, openMobile } = useSidebar();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden fixed top-4 right-4 z-50 h-10 w-10 rounded-lg bg-background/90 backdrop-blur-sm border border-border shadow-lg hover:bg-accent transition-all"
      onClick={() => setOpenMobile(!openMobile)}
      aria-label={openMobile ? "Close menu" : "Open menu"}
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">{openMobile ? "Close menu" : "Open menu"}</span>
    </Button>
  );
};

const AppLayoutContent = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen flex w-full bg-background relative overflow-hidden">
      {/* Game-themed background pattern */}
      <div className="fixed inset-0 game-grid-bg opacity-30 -z-10" />
      <div className="fixed inset-0 particle-bg -z-10" />
      
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <div className="min-h-screen relative">
          <MobileMenuButton />
          {children}
        </div>
      </main>
    </div>
  );
};

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <SidebarProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  );
};
