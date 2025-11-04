import { 
  LayoutDashboard, 
  Users, 
  Swords, 
  Trophy, 
  Receipt, 
  Activity, 
  FileText, 
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
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sidebar-primary to-accent flex items-center justify-center shadow-lg">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sidebar-foreground text-lg">Truco Admin</span>
              <span className="text-xs text-sidebar-foreground/70">Game Management</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/60 mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm'
                            : 'hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground'
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {!isCollapsed && user && (
          <div className="mb-3 px-2 py-2 rounded-lg bg-sidebar-accent/30">
            <div className="text-xs font-medium text-sidebar-foreground">{user.name}</div>
            <div className="text-xs text-sidebar-foreground/60">{user.email}</div>
          </div>
        )}
        <Button 
          variant="outline" 
          size={isCollapsed ? "icon" : "default"}
          onClick={handleLogout}
          className="w-full border-sidebar-border hover:bg-sidebar-accent transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Logout</span>}
        </Button>
      </SidebarFooter>

      <SidebarTrigger className="absolute -right-4 top-4 z-10" />
    </Sidebar>
  );
};
