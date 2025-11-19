import { ReactNode, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Activity,
  Utensils,
  TrendingUp,
  Shield,
  LogOut,
  Menu,
  X,
  Heart,
  ScanLine,
  Calendar,
  Pill,
  MessageSquare,
  Stethoscope,
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}


const SIDEBAR_WIDTH = 256; // 256px

const Layout = ({ children }: LayoutProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setAuthChecked(true);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setAuthChecked(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!authChecked) return;

    if (!user && location.pathname !== "/auth") {
      navigate("/auth");
    }

    if (user && location.pathname === "/auth") {
      navigate("/dashboard");
    }
  }, [user, authChecked, navigate, location.pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: ScanLine, label: "Med Scan AI", path: "/med-scan" },
    { icon: Utensils, label: "NutriSnap & Diet", path: "/nutrition" },
    { icon: Activity, label: "IoT Devices", path: "/iot-integration" },
    { icon: TrendingUp, label: "Predictive Health", path: "/predictive-health" },
    { icon: Pill, label: "Medications", path: "/medications" },
    { icon: Calendar, label: "Appointments", path: "/appointments" },
    { icon: MessageSquare, label: "Health Chat", path: "/health-chatbot" },
    { icon: Stethoscope, label: "Find Doctor", path: "/doctor-search" },
    { icon: Shield, label: "Family Safety", path: "/family-safety" },
  ];

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "w-64 shrink-0 flex flex-col bg-card border-r border-border transition-transform duration-200 ease-in-out",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-3 h-16 px-5 border-b border-border shrink-0 w-full hover:bg-accent/50 transition-colors"
        >
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            VitalSense
          </span>
        </button>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-10 px-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary hover:bg-primary/15"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </nav>

        {/* User Info & Logout */}
        <div className="p-3 border-t border-border shrink-0">
          <div className="mb-3 px-2">
            <p className="text-sm font-medium truncate text-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground">AI Health Companion</p>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-3 h-9 text-sm" 
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-h-screen overflow-auto ml-2 mt-2">

        {/* Mobile Header */}
        <header className="lg:hidden h-14 sticky top-0 z-40 bg-background border-b border-border flex items-center px-4 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-2 ml-3">
            <div className="w-7 h-7 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              VitalSense
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
