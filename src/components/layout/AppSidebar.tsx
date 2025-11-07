import {
  LayoutDashboard,
  Users,
  Swords,
  Trophy,
  Receipt,
  Activity,
  FileText,
  Bell,
  LogOut
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
  useSidebar
} from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Users', url: '/users', icon: Users },
  { title: 'Matches', url: '/matches', icon: Swords },
  { title: 'Tournaments', url: '/tournaments', icon: Trophy },
  { title: 'Transactions', url: '/transactions', icon: Receipt },
  { title: 'Alerts', url: '/alerts', icon: Bell },
  { title: 'Live Monitor', url: '/live', icon: Activity },
  { title: 'Reports', url: '/reports', icon: FileText },
];

export const AppSidebar = () => {
  const { state } = useSidebar();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const isCollapsed = state === 'collapsed';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar-background/95 backdrop-blur-sm">
      <SidebarHeader className="border-b border-sidebar-border/50 p-4 bg-gradient-to-r from-sidebar-primary/10 to-transparent">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-sidebar-primary via-sidebar-primary to-accent flex items-center justify-center shadow-lg ring-2 ring-sidebar-primary/20">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sidebar-foreground text-lg tracking-tight">Truco Admin</span>
              <span className="text-xs text-sidebar-foreground/60 font-medium">Game Management</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/50 mb-3 px-2 uppercase tracking-wider">
            {!isCollapsed && 'Main Menu'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1.5">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) => {
                        const baseClasses = "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group";
                        const activeClasses = isActive
                          ? 'bg-gradient-to-r from-sidebar-primary/20 to-sidebar-primary/10 text-sidebar-accent-foreground font-semibold shadow-md border border-sidebar-primary/30'
                          : 'hover:bg-sidebar-accent/40 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:translate-x-1';
                        return `${baseClasses} ${activeClasses}`;
                      }}
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon className={`h-4.5 w-4.5 flex-shrink-0 ${isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/60 group-hover:text-sidebar-foreground'}`} />
                          {!isCollapsed && <span className="text-sm">{item.title}</span>}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/50 p-3 space-y-2 bg-sidebar-background/50">
        {!isCollapsed && user && (
          <div className="mb-3 px-3 py-2.5 rounded-lg bg-sidebar-accent/20 border border-sidebar-accent/20">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sidebar-primary to-accent flex items-center justify-center text-xs font-bold text-white">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-sidebar-foreground truncate">{user.name}</div>
                <div className="text-xs text-sidebar-foreground/50 truncate">{user.email}</div>
              </div>
            </div>
          </div>
        )}
        <div className="w-full">
          <Button
            variant="ghost"
            size={isCollapsed ? "icon" : "default"}
            onClick={handleLogout}
            className={`${isCollapsed ? 'w-full' : 'w-full'} justify-start gap-2 text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive transition-all duration-200`}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </Button>
        </div>
      </SidebarFooter>

      <SidebarTrigger className="absolute -right-3 top-4 z-10 h-8 w-8 rounded-full border-2 border-sidebar-border bg-sidebar-background shadow-lg hover:bg-sidebar-accent/20 transition-colors" />
    </Sidebar>
  );
};
