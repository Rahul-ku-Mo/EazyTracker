"use client";

import {
  BadgeCheck,
  // Bell,
  // CreditCard,
  ChevronsUpDown,
  LogOut,
  Sparkles,
  Crown,
  Building2,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useGetSubscriptionStatus } from "../hooks/useBilling";

export function NavUser({
  user,
}: {
  user?: {
    username: string;
    email: string;
    imageUrl: string | null;
  };
}) {
  const { isMobile } = useSidebar();
  const { data: subscription } = useGetSubscriptionStatus();

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setIsLoggedIn, role } = useContext(AuthContext);

  // Check if user is admin
  const isAdmin = role === "ADMIN";

  const handleLogout = (): void => {
    Cookies.remove("accessToken");

    localStorage.removeItem("teamId");
    localStorage.removeItem("userId");
    localStorage.removeItem("teamName");
    localStorage.removeItem("email");
    localStorage.removeItem("trialModalDismissed");

    setIsLoggedIn(false);
    queryClient.clear();
    navigate("/auth");
  };

  const handleUpgradeClick = () => {
    const plan = subscription?.plan?.toLowerCase();

    if (plan === "enterprise") {
      // For enterprise users, open contact sales email
      const subject = encodeURIComponent(
        "Enterprise Plan Inquiry - Custom Solution"
      );
      const body = encodeURIComponent(`Hello,

I'm currently on the Enterprise plan and would like to discuss custom solutions or additional features.

User: ${user?.username}
Email: ${user?.email}
Current Plan: Enterprise

Please contact me to discuss our requirements.

Best regards,
${user?.username}`);

      window.open(
        `mailto:support@pulseboard.co.in?subject=${subject}&body=${body}`,
        "_blank"
      );
    } else {
      // For free and pro users, navigate to billing page
      navigate("/billing");
    }
  };

  // Determine upgrade option based on current plan and admin status
  const getUpgradeOption = () => {
    // Only show billing/upgrade options for admin users
    if (!isAdmin) {
      return {
        text: "",
        icon: Sparkles,
        show: false,
      };
    }

    if (!subscription) {
      return {
        text: "Upgrade to Pro",
        icon: Sparkles,
        show: true,
      };
    }

    const plan = subscription.plan?.toLowerCase();
    const isTrialActive =
      subscription.trialEnd && new Date(subscription.trialEnd) > new Date();

    switch (plan) {
      case "free":
        if (isTrialActive) {
          return {
            text: "Upgrade to Pro",
            icon: Sparkles,
            show: true,
          };
        }
        return {
          text: "Upgrade to Pro",
          icon: Sparkles,
          show: true,
        };
      case "pro":
        return {
          text: "Upgrade to Enterprise",
          icon: Crown,
          show: true,
        };
      case "enterprise":
        return {
          text: "Contact Sales",
          icon: Building2,
          show: true,
        };
      default:
        return {
          text: "Upgrade to Pro",
          icon: Sparkles,
          show: true,
        };
    }
  };

  const upgradeOption = getUpgradeOption();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="w-8 h-8 rounded-lg">
                <AvatarImage src={user?.imageUrl || ""} alt={user?.username} className="object-cover object-top" />
                <AvatarFallback className="rounded-lg">
                  {user?.username.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-sm text-left">
                <span className="font-semibold truncate">{user?.username}</span>
                <span className="text-[11px] truncate">{user?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto h-4 w-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="w-8 h-8 rounded-lg">
                  <AvatarImage
                    src={user?.imageUrl || ""}
                    alt={user?.username}
                  />
                  <AvatarFallback className="rounded-lg">
                    {user?.username?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-sm text-left">
                  <span className="font-semibold truncate">
                    {user?.username}
                  </span>
                  <span className="text-[11px] truncate">{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {upgradeOption.show && (
                <DropdownMenuItem onClick={handleUpgradeClick} className="text-sm">
                  <upgradeOption.icon className="h-4 w-4" />
                  {upgradeOption.text}
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate("/setting/account")} className="text-sm">
                <BadgeCheck className="h-4 w-4" />
                Settings
              </DropdownMenuItem>
              {/* <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem> */}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-sm">
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
