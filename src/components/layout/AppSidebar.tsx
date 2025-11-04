import { 
  LayoutDashboard, 
  Users, 
  Swords, 
  Trophy, 
  Receipt, 
  Activity, 
  FileText, 
  LogOut,
  Menu
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
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Trophy className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sidebar-foreground">Truco Admin</span>
              <span className="text-xs text-sidebar-foreground/70">Game Management</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'hover:bg-sidebar-accent/50'
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
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
          <div className="mb-2 text-xs text-sidebar-foreground/70">
            Logged in as: {user.name}
          </div>
        )}
        <Button 
          variant="outline" 
          size={isCollapsed ? "icon" : "default"}
          onClick={handleLogout}
          className="w-full"
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Logout</span>}
        </Button>
      </SidebarFooter>

      <SidebarTrigger className="absolute -right-4 top-4 z-10" />
    </Sidebar>
  );
};
