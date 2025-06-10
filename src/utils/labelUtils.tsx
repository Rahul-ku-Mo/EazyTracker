import {
  Code,
  Palette,
  Globe,
  Zap,
  Lock,
  Database,
  Smartphone,
  TestTube,
  FileText,
  BarChart3,
  Bot,
  Users,
  Search,
  CreditCard,
  Share2,
  Cloud,
  HelpCircle,
  Star,
  Wrench,
  Monitor,
  Layers,
  Tag,
} from "lucide-react";

export const getLabelIcon = (label: string) => {
  const labelLower = label.toLowerCase();
  
  // Backend/Development
  if (labelLower.includes('backend') || labelLower.includes('api') || labelLower.includes('server')) {
    return <Code className="w-3 h-3" />;
  }
  
  // Frontend/UI
  if (labelLower.includes('frontend') || labelLower.includes('ui') || labelLower.includes('design')) {
    return <Palette className="w-3 h-3" />;
  }
  
  // Security
  if (labelLower.includes('security') || labelLower.includes('auth') || labelLower.includes('critical')) {
    return <Lock className="w-3 h-3" />;
  }
  
  // Database
  if (labelLower.includes('database') || labelLower.includes('data') || labelLower.includes('performance')) {
    return <Database className="w-3 h-3" />;
  }
  
  // Mobile
  if (labelLower.includes('mobile') || labelLower.includes('responsive')) {
    return <Smartphone className="w-3 h-3" />;
  }
  
  // Testing
  if (labelLower.includes('testing') || labelLower.includes('qa') || labelLower.includes('ci')) {
    return <TestTube className="w-3 h-3" />;
  }
  
  // Documentation
  if (labelLower.includes('documentation') || labelLower.includes('docs')) {
    return <FileText className="w-3 h-3" />;
  }
  
  // Analytics
  if (labelLower.includes('analytics') || labelLower.includes('dashboard') || labelLower.includes('ml')) {
    return <BarChart3 className="w-3 h-3" />;
  }
  
  // AI
  if (labelLower.includes('ai') || labelLower.includes('bot') || labelLower.includes('chat')) {
    return <Bot className="w-3 h-3" />;
  }
  
  // UX/User Experience
  if (labelLower.includes('ux') || labelLower.includes('user') || labelLower.includes('onboard')) {
    return <Users className="w-3 h-3" />;
  }
  
  // SEO/Search
  if (labelLower.includes('seo') || labelLower.includes('search')) {
    return <Search className="w-3 h-3" />;
  }
  
  // Payment/Billing
  if (labelLower.includes('payment') || labelLower.includes('billing') || labelLower.includes('paddle')) {
    return <CreditCard className="w-3 h-3" />;
  }
  
  // Social/Integration
  if (labelLower.includes('social') || labelLower.includes('integration') || labelLower.includes('oauth')) {
    return <Share2 className="w-3 h-3" />;
  }
  
  // DevOps/Infrastructure
  if (labelLower.includes('devops') || labelLower.includes('infrastructure') || labelLower.includes('monitoring')) {
    return <Cloud className="w-3 h-3" />;
  }
  
  // Architecture
  if (labelLower.includes('architecture') || labelLower.includes('microservices')) {
    return <Layers className="w-3 h-3" />;
  }
  
  // CMS/Content
  if (labelLower.includes('cms') || labelLower.includes('content') || labelLower.includes('editor')) {
    return <Monitor className="w-3 h-3" />;
  }
  
  // Support
  if (labelLower.includes('support') || labelLower.includes('help')) {
    return <HelpCircle className="w-3 h-3" />;
  }
  
  // Internationalization
  if (labelLower.includes('i18n') || labelLower.includes('global') || labelLower.includes('translation')) {
    return <Globe className="w-3 h-3" />;
  }
  
  // Feature/Enhancement
  if (labelLower.includes('feature') || labelLower.includes('enhancement')) {
    return <Star className="w-3 h-3" />;
  }
  
  // Hotfix/Bug
  if (labelLower.includes('hotfix') || labelLower.includes('bug') || labelLower.includes('fix')) {
    return <Wrench className="w-3 h-3" />;
  }
  
  // Real-time/WebSocket
  if (labelLower.includes('real-time') || labelLower.includes('websocket') || labelLower.includes('notification')) {
    return <Zap className="w-3 h-3" />;
  }
  
  // Default
  return <Tag className="w-3 h-3" />;
};

export const getLabelColors = (label: string, index: number) => {
  const labelLower = label.toLowerCase();
  
  // Predefined colors for specific label types
  if (labelLower.includes('backend') || labelLower.includes('api') || labelLower.includes('server')) {
    return "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700";
  }
  
  if (labelLower.includes('frontend') || labelLower.includes('ui') || labelLower.includes('design')) {
    return "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700";
  }
  
  if (labelLower.includes('security') || labelLower.includes('auth') || labelLower.includes('critical')) {
    return "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700";
  }
  
  if (labelLower.includes('database') || labelLower.includes('data') || labelLower.includes('performance')) {
    return "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700";
  }
  
  if (labelLower.includes('mobile') || labelLower.includes('responsive')) {
    return "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700";
  }
  
  if (labelLower.includes('testing') || labelLower.includes('qa') || labelLower.includes('ci')) {
    return "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700";
  }
  
  if (labelLower.includes('documentation') || labelLower.includes('docs')) {
    return "bg-gray-100 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700";
  }
  
  if (labelLower.includes('analytics') || labelLower.includes('dashboard') || labelLower.includes('ml')) {
    return "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-700";
  }
  
  if (labelLower.includes('ai') || labelLower.includes('bot') || labelLower.includes('chat')) {
    return "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-700";
  }
  
  if (labelLower.includes('social') || labelLower.includes('integration') || labelLower.includes('oauth')) {
    return "bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-700";
  }
  
  if (labelLower.includes('devops') || labelLower.includes('infrastructure') || labelLower.includes('monitoring')) {
    return "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-700";
  }
  
  if (labelLower.includes('hotfix') || labelLower.includes('bug') || labelLower.includes('fix')) {
    return "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700";
  }
  
  if (labelLower.includes('feature') || labelLower.includes('enhancement')) {
    return "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700";
  }
  
  // Fallback to cycling colors for unmatched labels
  const colorVariants = [
    "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700",
    "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700", 
    "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700",
    "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700",
    "bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-700",
    "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-700"
  ];
  
  return colorVariants[index % colorVariants.length];
}; 