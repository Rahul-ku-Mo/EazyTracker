import MainLayout from "@/layouts/Container";
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";
import { UserRoundCogIcon, MapPinHouseIcon, Plug, Clock, Crown, Calendar } from "lucide-react";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Account = ({ children }: { children: React.ReactNode }) => {
  const pathname = useLocation().pathname;
  const { trialStatus } = useTrialStatus();

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

          {/* Trial Status Card */}
          {trialStatus && !trialStatus.hasActiveSubscription && (
            <div className="p-4 bg-card border border-border/50 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                {trialStatus.trialExpired ? (
                  <Clock className="w-4 h-4 text-red-500" />
                ) : (
                  <Crown className="w-4 h-4 text-blue-500" />
                )}
                <h3 className="font-semibold text-foreground">
                  {trialStatus.trialExpired ? 'Trial Expired' : 'Free Trial'}
                </h3>
                {!trialStatus.trialExpired && (
                  <Badge variant="secondary" className="text-xs">
                    {trialStatus.daysRemaining} day{trialStatus.daysRemaining !== 1 ? 's' : ''} left
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground mb-3">
                {trialStatus.trialExpired ? (
                  <div className="space-y-1">
                    <p className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      Your free trial has ended
                    </p>
                    <p className="text-xs">
                      Upgrade to continue using all features
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {trialStatus.daysRemaining} day{trialStatus.daysRemaining !== 1 ? 's' : ''} remaining
                    </p>
                    <p className="text-xs">
                      Access to all features until trial expires
                    </p>
                  </div>
                )}
              </div>
              
              <Link to="/billing">
                <Button size="sm" className="w-full">
                  {trialStatus.trialExpired ? 'Upgrade Now' : 'View Plans'}
                </Button>
              </Link>
            </div>
          )}
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
