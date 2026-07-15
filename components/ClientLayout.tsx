'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  Mail,
  CheckSquare,
  Briefcase,
  Users,
  Archive,
  LogOut,
  Loader2,
  MailCheck,
  User as UserIcon,
  Menu,
  Bell,
  Home
} from 'lucide-react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isAuthPage = pathname === '/login' || pathname === '/register';

  useEffect(() => {
    if (!loading && !user && !isAuthPage) {
      router.push('/login');
    }
  }, [user, loading, isAuthPage, router]);

  if (loading && !isAuthPage) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-200">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-sm text-slate-400">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  // Auth pages (login, register) render directly without Sidebar/Navbar
  if (isAuthPage) {
    return <>{children}</>;
  }

  // STRICT GUARD: Do not render protected pages if not logged in
  if (!user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-200">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Courriers', path: '/courriers', icon: Mail },
    { name: 'Tâches', path: '/tasks', icon: CheckSquare },
    { name: 'Services', path: '/services', icon: Briefcase },
    { name: 'Contacts', path: '/contacts', icon: Users },
    ...(user?.role === 'admin' ? [{ name: 'Utilisateurs', path: '/users', icon: UserIcon }] : []),
    { name: 'Archives', path: '/archives', icon: Archive },
  ];

  const currentMenuItem = menuItems.find(item => item.path === pathname);
  const pageName = currentMenuItem ? currentMenuItem.name : 'Détails';
  const userInitials = user?.nom_utilis ? user.nom_utilis.substring(0, 2).toUpperCase() : 'US';

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/20">
              <MailCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Gestion Courrier
              </h1>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Système de gestion
              </span>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 text-indigo-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/50">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 border border-slate-700 hover:border-red-500/20 text-slate-300 font-medium rounded-xl text-sm transition-all duration-150 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950">
        {/* Top bar */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors cursor-pointer lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Link href="/" className="hover:text-slate-200 transition-colors flex items-center gap-1.5">
                <Home className="h-4 w-4" />
                Accueil
              </Link>
              <span>/</span>
              <span className="text-slate-200 font-medium">{pageName}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors relative cursor-pointer">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-slate-900"></span>
            </button>
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-md cursor-pointer border border-indigo-400/20">
              {userInitials}
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
