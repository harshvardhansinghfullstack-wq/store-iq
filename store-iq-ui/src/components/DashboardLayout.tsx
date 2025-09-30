import { Link, NavLink } from "react-router-dom"; // Import Link and NavLink
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Home,
  LayoutGrid,
  BarChart2,
  Video,
  Upload,
  FileEdit,
  Settings,
  Plus,
  Menu
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// --- CONSTANTS defined outside the component to prevent re-creation on re-renders ---
const sidebarItems = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: LayoutGrid, label: "Publish", href: "/dashboard/publish" },
  { icon: BarChart2, label: "Stats", href: "/dashboard/stats" },
];

const creationItems = [
  { icon: Video, label: "Videos", href: "/dashboard/videos" },
  { icon: Upload, label: "Exports", href: "/dashboard/exports" },
];

const inspirationItems = [
  { icon: FileEdit, label: "AI-Tools", href: "/dashboard/aitools" },
  { icon: Settings, label: "Account Settings", href: "/dashboard/settings" },
];


import { useState } from "react";

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Sidebar content as a variable to avoid duplication
  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-6">
        <Link to="/dashboard" className="text-white font-bold text-lg inline-block">
          STORIQ
        </Link>
      </div>
      {/* Navigation */}
      <nav className="flex-1 px-6 space-y-8">
        {/* Main Navigation */}
        <div className="space-y-2">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.href}
              end
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors",
                  isActive
                    ? "bg-storiq-purple text-white"
                    : "text-white/70 hover:text-white hover:bg-storiq-card-bg"
                )
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
        {/* Creation Section */}
        <div>
          <h3 className="text-white/60 text-sm font-medium mb-3">Creation</h3>
          <div className="space-y-2">
            {creationItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors",
                    isActive
                      ? "bg-storiq-purple text-white"
                      : "text-white/70 hover:text-white hover:bg-storiq-card-bg"
                  )
                }
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
        {/* Inspiration Section */}
        <div>
          <h3 className="text-white/60 text-sm font-medium mb-3">Inspiration</h3>
          <div className="space-y-2">
            {inspirationItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors",
                    isActive
                      ? "bg-storiq-purple text-white"
                      : "text-white/70 hover:text-white hover:bg-storiq-card-bg"
                  )
                }
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
      {/* Premium Plans */}
      <div className="p-6 mt-auto">
        <div className="bg-storiq-card-bg rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">Premium Plans</h4>
          <p className="text-white/60 text-sm mb-4">
            Upgrade your free plan into Premium Plans
          </p>
          <Button className="w-full bg-storiq-purple hover:bg-storiq-purple/80 text-white rounded-full py-2">
            Upgrade Now
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-storiq-dark flex flex-col">
      {/* Header for mobile */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-storiq-border bg-storiq-dark">
        <button
          type="button"
          className="text-white"
          aria-label="Open sidebar"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={28} />
        </button>
        <Link to="/dashboard" className="text-white font-bold text-lg">
          STORIQ
        </Link>
      </header>
      <div className="flex flex-1">
        {/* Sidebar: Sheet on mobile, aside on desktop */}
        {isMobile ? (
          <Sheet open={isSidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="p-0 w-64 bg-storiq-dark border-r border-storiq-border flex flex-col">
              <SheetTitle className="sr-only">Sidebar Navigation</SheetTitle>
              {sidebarContent}
            </SheetContent>
          </Sheet>
        ) : (
          <aside className="w-64 bg-storiq-dark border-r border-storiq-border flex flex-col flex-shrink-0 hidden md:flex">
            {sidebarContent}
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;