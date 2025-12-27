import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut, MessageSquare, LayoutDashboard, Search } from "lucide-react";
import { clsx } from "clsx";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const isAuthPage = location === "/login" || location === "/register" || location === "/";

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/mentors", label: "Browse Mentors", icon: Search, role: "student" },
    { href: "/messages", label: "Messages", icon: MessageSquare },
  ];

  const filteredNav = navItems.filter(item => !item.role || item.role === user?.role);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <div className="p-2 bg-primary rounded-lg">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="hidden md:inline-block font-display text-xl font-bold tracking-tight text-primary">
                EliteGuidance
              </span>
            </Link>
          </div>

          <nav className="flex items-center gap-6">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                  {filteredNav.map((item) => (
                    <Link key={item.href} href={item.href} className={clsx(
                      "flex items-center gap-2 transition-colors hover:text-primary",
                      location === item.href && "text-primary font-semibold"
                    )}>
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                </div>
                <div className="flex items-center gap-4 border-l pl-4 ml-2">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => logout()} title="Logout">
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </>
            ) : (
              !isAuthPage && (
                <div className="flex gap-4">
                  <Link href="/login">
                    <Button variant="ghost">Log In</Button>
                  </Link>
                  <Link href="/register">
                    <Button>Get Started</Button>
                  </Link>
                </div>
              )
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 md:px-6">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2024 EliteGuidance Inc. Empowering academic excellence.
          </p>
        </div>
      </footer>
    </div>
  );
}
