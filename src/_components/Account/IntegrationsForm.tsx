import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  MessageCircle,
  Github,
  HardDrive,
  Calendar,
  Figma,
  GitBranch,
  Zap,
  BarChart3,
  Plug,
  Star,
  Sparkles,
  LucideIcon,
  Users,
  Paintbrush
} from "lucide-react";
import clsx from "clsx";

interface IntegrationCardProps {
  name: string;
  icon: LucideIcon;
  description: string;
  category: string;
  popular?: boolean;
  comingSoon?: boolean;
}

const IntegrationCard = ({ 
  name, 
  icon: Icon, 
  description,
  category,
  popular = false,
  comingSoon = true
}: IntegrationCardProps) => {
  return (
    <div className={clsx(
      "group relative p-4 rounded-xl border transition-all duration-300",
      "hover:shadow-lg hover:scale-105 hover:-translate-y-1",
      "bg-gradient-to-br from-card to-card/50",
      "border-border/50 hover:border-primary/30"
    )}>
      {popular && (
        <div className="absolute -top-2 -right-2">
          <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
            <Star className="w-3 h-3 mr-1" />
            Popular
          </Badge>
        </div>
      )}
      
      <div className="flex items-start space-x-3">
        <div className={clsx(
          "p-2.5 rounded-lg transition-all duration-200",
          "bg-gradient-to-br from-primary/10 to-primary/5",
          "group-hover:from-primary/20 group-hover:to-primary/10"
        )}>
          <Icon className="w-5 h-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">{name}</h3>
            <Badge variant="secondary" className="text-xs">
              {category}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          
          {comingSoon && (
            <div className="flex items-center gap-1 mt-2">
                          <Sparkles className="w-3 h-3 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Coming Soon
            </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const IntegrationsForm = () => {

  const integrationsList = [
    // Communication
    {
      name: 'Slack',
      icon: MessageSquare,
      description: 'Get real-time notifications, create tasks from messages, and sync project updates with your team channels.',
      category: 'Communication',
      popular: true
    },
    {
      name: 'Discord',
      icon: MessageCircle,
      description: 'Perfect for developer teams and gaming companies. Voice channel integration for standups and bot commands.',
      category: 'Communication'
    },
    {
      name: 'Microsoft Teams',
      icon: Users,
      description: 'Enterprise-focused communication with meeting integration and Office 365 connectivity.',
      category: 'Communication'
    },
    
    // Development
    {
      name: 'GitHub',
      icon: Github,
      description: 'Link commits, pull requests, and issues to tasks. Automatic status updates based on code changes.',
      category: 'Development',
      popular: true
    },
    {
      name: 'GitLab',
      icon: GitBranch,
      description: 'CI/CD pipeline status, merge request tracking, and seamless DevOps workflow integration.',
      category: 'Development'
    },
    
    // Design & Creative
    {
      name: 'Figma',
      icon: Figma,
      description: 'Attach design files to tasks, track design reviews, and manage asset handoffs seamlessly.',
      category: 'Design',
      popular: true
    },
    {
      name: 'Adobe Creative Cloud',
      icon: Paintbrush,
      description: 'Creative asset management, approval workflows, and brand consistency tracking.',
      category: 'Design'
    },
    
    // Productivity
    {
      name: 'Google Calendar',
      icon: Calendar,
      description: 'Task deadlines as calendar events, meeting scheduling, and project milestone reminders.',
      category: 'Productivity'
    },
    {
      name: 'Google Drive',
      icon: HardDrive,
      description: 'Attach documents directly to tasks, real-time collaborative editing, and version control.',
      category: 'Productivity'
    },

    
    // Analytics
    {
      name: 'Google Analytics',
      icon: BarChart3,
      description: 'Track project website performance, campaign effectiveness, and user behavior insights.',
      category: 'Analytics'
    }
  ];

  const categories = [...new Set(integrationsList.map(item => item.category))];
  const popularIntegrations = integrationsList.filter(item => item.popular);

  return (
    <div className="w-full space-y-8">
      {/* Header Section */}
      <Card className="border-border/50 shadow-lg bg-gradient-to-br from-card to-card/50">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
              <Plug className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground mb-2">
            Integrations Coming Soon!
          </CardTitle>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We're building powerful integrations to connect your favorite tools with our platform. 
            Streamline your workflow and boost productivity with seamless connections.
          </p>
        </CardHeader>
      </Card>

      {/* Popular Integrations Highlight */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-emerald-500" />
            Most Requested Integrations
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            These are the integrations our users are most excited about
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {popularIntegrations.map((integration) => (
              <IntegrationCard
                key={integration.name}
                {...integration}
                popular={true}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Integrations by Category */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Planned Integrations
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Explore all the integrations we're planning to build
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          {categories.map((category) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-foreground">{category}</h3>
                <Badge variant="outline" className="text-xs">
                  {integrationsList.filter(item => item.category === category).length} integrations
                </Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {integrationsList
                  .filter(item => item.category === category)
                  .map((integration) => (
                    <IntegrationCard
                      key={integration.name}
                      {...integration}
                    />
                  ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>


    </div>
  );
};

export default IntegrationsForm;
