import MainLayout from "@/layouts/Container";
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";
import { UserRoundCogIcon, MapPinHouseIcon, Plug } from "lucide-react";

const Account = ({ children }: { children: React.ReactNode }) => {
  const pathname = useLocation().pathname;

  const navigationItems = [
    {
      to: "/setting/account",
      icon: UserRoundCogIcon,
      label: "Personalization",
      description: "Manage your profile and account settings"
    },
    {
      to: "/setting/location",
      icon: MapPinHouseIcon,
      label: "Location",
      description: "Update your address and location details"
    },
    {
      to: "/setting/integrations",
      icon: Plug,
      label: "Integrations",
      description: "Connect with your favorite tools"
    }
  ];

  return (
    <MainLayout title="Settings" fwdClassName="flex flex-col !pl-0 !pr-2">
      <div className="flex h-full gap-6 text-sm">
        {/* Sidebar Navigation */}
        <aside className="sticky top-0 flex flex-col space-y-1 w-64 h-fit">
          <div className="p-4 bg-card border border-border/50 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-1">Settings</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Manage your account preferences and integrations
            </p>
            
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.to;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={clsx(
                      "group flex items-start gap-3 p-3 rounded-md transition-all duration-200",
                      "hover:bg-muted/50 hover:border-border/50",
                      isActive 
                        ? "bg-primary/10 text-primary border border-primary/20" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className={clsx(
                      "w-4 h-4 mt-0.5 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )} />
                    
                    <div className="flex-1 min-w-0">
                      <div className={clsx(
                        "font-medium text-sm transition-colors",
                        isActive ? "text-primary" : "text-foreground"
                      )}>
                        {item.label}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 leading-tight">
                        {item.description}
                      </div>
                    </div>
                    
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </MainLayout>
  );
};

export default Account;
