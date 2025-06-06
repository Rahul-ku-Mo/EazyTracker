import { useState, useContext, useEffect } from "react";
import { toast } from "sonner";
import { AuthContext } from "@/context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserIntegrations } from "@/apis/userApis";
import { UserContext } from "@/context/UserContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  MessageCircle,
  Mail,
  Github,
  HardDrive,
  LucideIcon,
  Plug,
  CheckCircle,
  Circle
} from "lucide-react";
import clsx from "clsx";

interface IntegrationCardProps {
  name: string;
  icon: LucideIcon;
  connected: boolean;
  onToggle: () => void;
  description: string;
  isPending?: boolean;
}

interface IntegrationsState {
  discord: boolean;
  slack: boolean;
  mailchimp: boolean;
  github: boolean;
  googleDrive: boolean;
}

const IntegrationCard = ({ 
  name, 
  icon: Icon, 
  connected, 
  onToggle, 
  description,
  isPending = false 
}: IntegrationCardProps) => {
  return (
    <div className={clsx(
      "group relative p-4 rounded-lg border border-border/50 bg-card transition-all duration-200",
      "hover:border-border hover:shadow-md",
      connected && "ring-1 ring-primary/20 bg-primary/5"
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className={clsx(
            "p-2 rounded-md transition-colors",
            connected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}>
            <Icon className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-foreground">{name}</h3>
              {connected ? (
                <CheckCircle className="w-4 h-4 text-primary" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
        
        <Button
          onClick={onToggle}
          disabled={isPending}
          size="sm"
          variant={connected ? "secondary" : "outline"}
          className={clsx(
            "ml-3 transition-all duration-200",
            connected && "bg-primary/10 text-primary hover:bg-primary/20",
            isPending && "opacity-50 cursor-not-allowed"
          )}
        >
          {isPending ? (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">...</span>
            </div>
          ) : (
            <span className="text-xs font-medium">
              {connected ? "Connected" : "Connect"}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

const IntegrationsForm = () => {
  const { accessToken } = useContext(AuthContext);
  const { user, isPending } = useContext(UserContext);
  const queryClient = useQueryClient();

  const [integrations, setIntegrations] = useState<IntegrationsState>({
    discord: false,
    slack: false,
    mailchimp: false,
    github: false,
    googleDrive: false,
  });

  // Update integrations when user data loads
  useEffect(() => {
    if (user && user.integrations) {
      setIntegrations({
        discord: user.integrations.discord || false,
        slack: user.integrations.slack || false,
        mailchimp: user.integrations.mailchimp || false,
        github: user.integrations.github || false,
        googleDrive: user.integrations.googleDrive || false,
      });
    }
  }, [user?.integrations]);

  const updateIntegrationsMutation = useMutation({
    mutationFn: async (data: IntegrationsState) => {
      return await updateUserIntegrations(accessToken, data);
    },
    onSuccess: () => {
      toast.success("Integrations updated successfully");
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update integrations");
    },
  });

  const handleToggleIntegration = (integration: keyof IntegrationsState) => {
    const updatedIntegrations = {
      ...integrations,
      [integration]: !integrations[integration],
    };
    setIntegrations(updatedIntegrations);
    updateIntegrationsMutation.mutate(updatedIntegrations);
  };

  const integrationsList = [
    {
      key: 'discord' as keyof IntegrationsState,
      name: 'Discord',
      icon: MessageCircle,
      description: 'Get notifications and updates in your Discord server'
    },
    {
      key: 'slack' as keyof IntegrationsState,
      name: 'Slack',
      icon: MessageSquare,
      description: 'Sync tasks and receive notifications in Slack channels'
    },
    {
      key: 'mailchimp' as keyof IntegrationsState,
      name: 'MailChimp',
      icon: Mail,
      description: 'Sync contacts and manage email campaigns'
    },
    {
      key: 'github' as keyof IntegrationsState,
      name: 'GitHub',
      icon: Github,
      description: 'Link commits and pull requests to your tasks'
    },
    {
      key: 'googleDrive' as keyof IntegrationsState,
      name: 'Google Drive',
      icon: HardDrive,
      description: 'Attach files and documents from Google Drive'
    }
  ];

  const connectedCount = Object.values(integrations).filter(Boolean).length;

  // Show loading while user data is being fetched
  if (isPending) {
    return (
      <Card className="w-full border-border/50 shadow-lg">
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Loading integrations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-border/50 shadow-lg">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
          <Plug className="h-5 w-5 text-primary" />
          Integrations
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Connect your favorite tools to streamline your workflow
        </p>
        
        {/* Stats */}
        <div className="flex items-center gap-4 pt-2">
          <div className="text-xs text-muted-foreground">
            {connectedCount} of {integrationsList.length} integrations connected
          </div>
          <div className="flex-1 bg-muted rounded-full h-1.5">
            <div 
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(connectedCount / integrationsList.length) * 100}%` }}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <h3 className="text-sm font-medium text-foreground">Available Integrations</h3>
          </div>
          
          <div className="grid gap-4 lg:grid-cols-2">
            {integrationsList.map((integration) => (
              <IntegrationCard
                key={integration.key}
                name={integration.name}
                icon={integration.icon}
                description={integration.description}
                connected={integrations[integration.key]}
                onToggle={() => handleToggleIntegration(integration.key)}
                isPending={updateIntegrationsMutation.isPending}
              />
            ))}
          </div>
          
          {/* Help Text */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border/50">
            <p className="text-xs text-muted-foreground">
                              <strong>Note:</strong> Integrations help you connect PulseBoard with your existing tools. 
              Each integration may require additional setup and permissions. 
              You can enable or disable them at any time.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntegrationsForm;
