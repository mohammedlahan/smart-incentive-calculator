'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Car,
  Sliders,
  BarChart3,
  PenTool,
  TrendingUp,
  History,
  LogOut,
  Menu,
  X,
  User,
  Shield,
  Loader2,
  Users
} from 'lucide-react';
import ThemeToggle from './theme-toggle';
import { useToast } from './ui/toast';

interface SidebarProps {
  role: 'ADMIN' | 'SALES_OFFICER';
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        toast('Logged out successfully.', 'success');
        router.push('/login');
        router.refresh();
      } else {
        toast('Logout failed.', 'error');
      }
    } catch (error) {
      toast('An error occurred during logout.', 'error');
    }
  };

  const adminLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/car-models', label: 'Car Models', icon: Car },
    { href: '/admin/slabs', label: 'Incentive Slabs', icon: Sliders },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/users', label: 'Manage Users', icon: Users },
  ];

  const salesLinks = [
    { href: '/sales/dashboard', label: 'Sales Dashboard', icon: LayoutDashboard },
    { href: '/sales/log-sales', label: 'Log Sales', icon: PenTool },
    { href: '/sales/realtime-tracker', label: 'Real-time Tracker', icon: TrendingUp },
    { href: '/sales/history', label: 'Sales History', icon: History },
  ];

  const links = role === 'ADMIN' ? adminLinks : salesLinks;

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="flex md:hidden items-center justify-between bg-card text-foreground px-4 py-3 border-b border-border w-full sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-bold tracking-tight text-md">Smart Incentive</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg bg-secondary text-secondary-foreground cursor-pointer"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col w-72 bg-card border-r border-border shadow-md transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:sticky md:h-screen`}
      >
        {/* Logo Section */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-border">
          <Shield className="h-8 w-8 text-primary animate-pulse" />
          <div>
            <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-primary to-rose-500 bg-clip-text text-transparent">
              Incentive Pro
            </h1>
            <p className="text-xs text-muted-foreground font-medium">Dealership Admin</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Profile and Settings Foot */}
        <div className="p-4 border-t border-border bg-muted/30">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : (
            user && (
              <div className="flex items-center gap-3 px-2 py-2 mb-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-bold text-foreground truncate">{user.name}</h4>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/15 text-primary border border-primary/20 mt-1 uppercase tracking-wide">
                    {role.replace('_', ' ')}
                  </span>
                </div>
              </div>
            )
          )}

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 flex-1 px-3 py-2 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-xs font-bold hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 cursor-pointer"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
        />
      )}
    </>
  );
}
