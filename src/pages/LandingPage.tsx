import { motion } from "framer-motion";
import {
  BarChart2,
  Clock,
  Users,
  Sparkles,
  Shield,
  Zap,
  CheckCircle,
  Bell,
  MessageSquare,
  Target,
  Calendar,
  TrendingUp,
  FileText,
  Palette,
  Bot,
  GitBranch,
  Timer,
  Eye,
  Share,
  Settings,

  Play,
  Rocket,
  Check
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeProvider";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";

import { Badge } from "../components/ui/badge";





interface TextGradientProps {
  children: React.ReactNode;
  className?: string;
}

export const TextGradient = ({ children, className }: TextGradientProps) => (
  <span
    className={cn(
      "text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-300 ",
      className
    )}
  >
    {children}
  </span>
);





const LandingPage = () => {
  const { setTheme, isDark } = useTheme();
  const [activeFeature, setActiveFeature] = useState(0);

  // Auto-rotate active feature
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: CheckCircle,
      title: "Kanban Boards",
      description: "Visual task management with custom columns",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: Bell,
      title: "Real-time Notifications", 
      description: "Instant alerts for all team activities",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Timer,
      title: "Time Tracking",
      description: "Built-in timer for accurate tracking",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Bot,
      title: "AI Assistant",
      description: "Smart writing and optimization",
      color: "from-orange-500 to-red-500"
    }
  ];



  return (
    <div className={cn(
      "min-h-screen relative overflow-hidden",
      isDark ? "bg-zinc-950" : "bg-white"
    )}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={cn(
          "absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20",
          "bg-gradient-to-br from-emerald-400 to-cyan-400"
        )} />
        <div className={cn(
          "absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20",
          "bg-gradient-to-tr from-emerald-400 to-blue-400"
        )} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-50">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <motion.div
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <span className={cn(
                  "text-xl font-bold",
                  isDark ? "text-white" : "text-zinc-900"
                )}>
                  EzTrack
                </span>
              </motion.div>

              <motion.div
                className="flex items-center space-x-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  className="text-sm font-semibold"
                >
                  {isDark ? "Light" : "Dark"} Mode
                </Button>
                <Link to="/auth">
                  <Button variant="ghost" className="text-sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 text-sm">
                    Get Started
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-6">
          <div className="container mx-auto max-w-7xl">
            <motion.div
              className="text-center max-w-4xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="mb-6"
              >
                <Badge className="mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                  🚀 New: Real-time notifications now live!
                </Badge>
              </motion.div>

              <motion.h1
                className={cn(
                  "text-5xl md:text-7xl font-bold mb-6 leading-tight",
                  isDark ? "text-white" : "text-zinc-900"
                )}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              >
                The Ultimate{" "}
                <span className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-cyan-500 bg-clip-text text-transparent">
                  Project Management
                </span>{" "}
                Experience
              </motion.h1>

              <motion.p
                className={cn(
                  "text-xl md:text-2xl mb-8 font-medium leading-relaxed max-w-3xl mx-auto",
                  isDark ? "text-zinc-300" : "text-zinc-600"
                )}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              >
                Transform your team's productivity with intelligent task management, 
                real-time collaboration, and powerful analytics. Everything you need to 
                deliver projects faster.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              >
                <Link to="/auth">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 text-lg px-8 py-3 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 ease-out"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Free Trial
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-lg px-8 py-3 h-auto rounded-xl border-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-500 ease-out"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  View Demo
                </Button>
              </motion.div>

              {/* Rotating Feature Showcase */}
              <motion.div
                className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    const isActive = index === activeFeature;
                    
                    return (
                      <div
                        key={feature.title}
                        className={cn(
                          "p-4 rounded-xl transition-all duration-500 ease-out text-center",
                          isActive
                            ? "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/50 dark:to-emerald-800/30 shadow-lg transform scale-105"
                            : "bg-transparent"
                        )}
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-lg mb-3 flex items-center justify-center mx-auto",
                          `bg-gradient-to-br ${feature.color}`,
                          isActive ? "shadow-lg" : "shadow-md"
                        )}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className={cn(
                          "font-semibold text-sm mb-1",
                          isDark ? "text-zinc-100" : "text-zinc-900"
                        )}>
                          {feature.title}
                        </h3>
                        <p className={cn(
                          "text-xs",
                          isDark ? "text-zinc-400" : "text-zinc-600"
                        )}>
                          {feature.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Core Features Section */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <Badge className="mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                Core Features
              </Badge>
              <h2 className={cn(
                "text-4xl md:text-5xl font-bold mb-4",
                isDark ? "text-white" : "text-zinc-900"
              )}>
                Everything You Need to{" "}
                <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                  Succeed
                </span>
              </h2>
              <p className={cn(
                "text-xl max-w-2xl mx-auto",
                isDark ? "text-zinc-300" : "text-zinc-600"
              )}>
                Powerful features designed to streamline your workflow and boost team productivity.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: CheckCircle,
                  title: "Kanban Boards",
                  description: "Visual task management with custom columns. Card completion tracking with Linear-style checkboxes. Sort and organize your workflow.",
                  gradient: "from-emerald-500 to-teal-500"
                },
                {
                  icon: Bell,
                  title: "Real-time Notifications",
                  description: "Instant alerts for card assignments. Updates and comments notifications. Overdue and due-soon reminders.",
                  gradient: "from-blue-500 to-cyan-500"
                },
                {
                  icon: Timer,
                  title: "Time Tracking",
                  description: "Built-in timer for accurate tracking. Session management with pause/resume. Automatic time calculations per card.",
                  gradient: "from-purple-500 to-pink-500"
                },
                {
                  icon: Bot,
                  title: "AI Assistant",
                  description: "Smart writing improvements. Content optimization. AI-powered conversations and assistance for your projects.",
                  gradient: "from-orange-500 to-red-500"
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className={cn(
                    "group relative p-8 rounded-2xl border-2 border-transparent transition-all duration-300",
                    "bg-white dark:bg-zinc-900",
                    "shadow-lg hover:shadow-2xl",
                    "hover:border-emerald-200 dark:hover:border-emerald-800"
                  )}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  whileHover={{ y: -2 }}
                >
                  <div className={cn(
                    "w-16 h-16 rounded-xl mb-6 flex items-center justify-center",
                    `bg-gradient-to-br ${feature.gradient}`,
                    "shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                  )}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className={cn(
                    "text-xl font-bold mb-3",
                    isDark ? "text-white" : "text-zinc-900"
                  )}>
                    {feature.title}
                  </h3>
                  <p className={cn(
                    "text-sm leading-relaxed",
                    isDark ? "text-zinc-400" : "text-zinc-600"
                  )}>
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Advanced Features Grid */}
        <section className="py-24 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="container mx-auto px-6">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <Badge className="mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                Advanced Features
              </Badge>
              <h2 className={cn(
                "text-4xl md:text-5xl font-bold mb-4",
                isDark ? "text-white" : "text-zinc-900"
              )}>
                Scale Your Team's{" "}
                <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                  Performance
                </span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: BarChart2,
                  title: "Advanced Analytics",
                  description: "Team performance metrics. Sprint velocity tracking. Completion rate analytics. Time distribution insights."
                },
                {
                  icon: Users,
                  title: "Team Management", 
                  description: "Role-based access control. Board permissions system. Team member onboarding. Activity monitoring."
                },
                {
                  icon: MessageSquare,
                  title: "Collaboration",
                  description: "Real-time card comments. Team discussions. Activity tracking. Seamless teamwork features."
                },
                {
                  icon: Calendar,
                  title: "Due Date Management",
                  description: "Visual due date indicators. Automatic overdue detection. Smart deadline reminders. Priority-based sorting."
                },
                {
                  icon: Target,
                  title: "Priority System",
                  description: "Color-coded priority levels. Urgency-based sorting. Visual priority indicators. Focus on what matters most."
                },
                {
                  icon: Palette,
                  title: "Dark/Light Themes",
                  description: "Beautiful dark and light mode support. Consistent design system. Comfortable viewing in any environment."
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className={cn(
                    "group p-6 rounded-xl transition-all duration-300",
                    "bg-white dark:bg-zinc-800/50",
                    "border border-zinc-200 dark:border-zinc-700",
                    "hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800"
                  )}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  whileHover={{ y: -2 }}
                >
                  <feature.icon className="w-8 h-8 text-emerald-500 mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className={cn(
                    "text-lg font-semibold mb-2",
                    isDark ? "text-white" : "text-zinc-900"
                  )}>
                    {feature.title}
                  </h3>
                  <p className={cn(
                    "text-sm",
                    isDark ? "text-zinc-400" : "text-zinc-600"
                  )}>
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Additional Features */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <Badge className="mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                More Features
              </Badge>
              <h2 className={cn(
                "text-4xl md:text-5xl font-bold",
                isDark ? "text-white" : "text-zinc-900"
              )}>
                Built for Modern{" "}
                <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                  Workspaces
                </span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Eye,
                  title: "Multiple Views",
                  description: "Switch between Kanban and List views to match your workflow preferences."
                },
                {
                  icon: FileText,
                  title: "Rich Text Editor",
                  description: "Powerful editor with formatting, links, and collaboration features."
                },
                {
                  icon: Share,
                  title: "Board Sharing",
                  description: "Share boards with team members and manage access permissions easily."
                },
                {
                  icon: Clock,
                  title: "Activity Tracking",
                  description: "Track card updates, completion status, and team activity in real-time."
                },
                {
                  icon: Settings,
                  title: "Team Settings",
                  description: "Comprehensive team management with roles, permissions, and onboarding."
                },
                {
                  icon: TrendingUp,
                  title: "Performance Insights",
                  description: "Analytics dashboard showing team velocity, completion rates, and trends."
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className={cn(
                    "group p-6 rounded-xl transition-all duration-300",
                    "bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-800 dark:to-zinc-900",
                    "border border-zinc-200 dark:border-zinc-700",
                    "hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800"
                  )}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={cn(
                        "font-semibold mb-2",
                        isDark ? "text-white" : "text-zinc-900"
                      )}>
                        {feature.title}
                      </h3>
                      <p className={cn(
                        "text-sm",
                        isDark ? "text-zinc-400" : "text-zinc-600"
                      )}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Coming Soon Section */}
        <section className="py-24 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="container mx-auto px-6">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                🚀 Coming Soon
              </div>
              <h2 className={cn(
                "text-4xl md:text-5xl font-bold mb-4",
                isDark ? "text-white" : "text-zinc-900"
              )}>
                Exciting Features on the{" "}
                <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                  Roadmap
                </span>
              </h2>
              <p className={cn(
                "text-xl max-w-2xl mx-auto",
                isDark ? "text-zinc-300" : "text-zinc-600"
              )}>
                We're constantly improving EzTrack. Here's what's coming next.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: GitBranch,
                  title: "Drag & Drop",
                  description: "Intuitive drag-and-drop for cards and columns"
                },
                {
                  icon: MessageSquare,
                  title: "@Mentions & Threads",
                  description: "Tag team members and threaded discussions"
                },
                {
                  icon: FileText,
                  title: "File Attachments",
                  description: "Upload and attach files directly to cards"
                },
                {
                  icon: Zap,
                  title: "Workflow Automation",
                  description: "Automate repetitive tasks and processes"
                },
                {
                  icon: Calendar,
                  title: "Calendar View",
                  description: "Timeline and calendar view for better planning"
                },
                {
                  icon: Palette,
                  title: "Custom Themes",
                  description: "Personalized layouts and board colors"
                },
                {
                  icon: Sparkles,
                  title: "Smart Suggestions",
                  description: "AI-powered workflow recommendations"
                },
                {
                  icon: Shield,
                  title: "Advanced Security",
                  description: "SSO, audit logs, and enterprise features"
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className={cn(
                    "group relative p-6 text-center rounded-xl overflow-hidden",
                    "bg-white dark:bg-zinc-800",
                    "border-2 border-dashed border-zinc-300 dark:border-zinc-600",
                    "hover:border-emerald-300 dark:hover:border-emerald-600",
                    "transition-all duration-300"
                  )}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true, margin: "-100px" }}
                                     whileHover={{ y: -2, scale: 1.01 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-6 h-6 text-emerald-500" />
                    </div>
                    <h3 className={cn(
                      "font-semibold mb-2",
                      isDark ? "text-white" : "text-zinc-900"
                    )}>
                      {feature.title}
                    </h3>
                    <p className={cn(
                      "text-xs mb-4",
                      isDark ? "text-zinc-400" : "text-zinc-600"
                    )}>
                      {feature.description}
                    </p>
                    <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                      Coming Soon
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

                 {/* CTA Section */}
         <section className="py-24 relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-cyan-600" />
           <div className="absolute inset-0 opacity-20">
             <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent"></div>
           </div>
          
          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              className="text-center max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Ready to Transform Your
                <br />
                <span className="text-emerald-100">Project Management?</span>
              </h2>
              <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
                Join thousands of teams already using EzTrack to deliver projects faster and more efficiently.
              </p>
              
              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Link to="/auth">
                  <Button 
                    size="lg" 
                    className="bg-white text-emerald-600 hover:bg-emerald-50 border-0 text-lg px-8 py-3 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                  >
                    <Rocket className="w-5 h-5 mr-2" />
                    Start Your Free Trial
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-white border-2 border-white/20 hover:bg-white/10 text-lg px-8 py-3 h-auto rounded-xl backdrop-blur-sm transition-all duration-300"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </motion.div>

              <motion.div
                className="flex items-center justify-center space-x-8 text-emerald-100"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5" />
                  <span className="text-sm">No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5" />
                  <span className="text-sm">14-day free trial</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5" />
                  <span className="text-sm">Cancel anytime</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className={cn(
          "py-16 border-t",
          isDark ? "bg-zinc-900 border-zinc-800" : "bg-zinc-50 border-zinc-200"
        )}>
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className={cn(
                    "text-xl font-bold",
                    isDark ? "text-white" : "text-zinc-900"
                  )}>
                    EzTrack
                  </span>
                </div>
                <p className={cn(
                  "mb-6 max-w-md",
                  isDark ? "text-zinc-400" : "text-zinc-600"
                )}>
                  The ultimate project management experience for modern teams. 
                  Built with love and designed for productivity.
                </p>
                <div className="flex space-x-4">
                  {/* Social links can be added here */}
                </div>
              </div>
              
              <div>
                <h3 className={cn(
                  "font-semibold mb-4",
                  isDark ? "text-white" : "text-zinc-900"
                )}>
                  Product
                </h3>
                <ul className={cn(
                  "space-y-2 text-sm",
                  isDark ? "text-zinc-400" : "text-zinc-600"
                )}>
                  <li><a href="#" className="hover:text-emerald-500 transition-colors">Features</a></li>
                  <li><span className="line-through opacity-50 cursor-not-allowed">Pricing</span></li>
                  <li><span className="line-through opacity-50 cursor-not-allowed">Integrations</span></li>
                  <li><span className="line-through opacity-50 cursor-not-allowed">API</span></li>
                </ul>
              </div>
              
              <div>
                <h3 className={cn(
                  "font-semibold mb-4",
                  isDark ? "text-white" : "text-zinc-900"
                )}>
                  Support
                </h3>
                <ul className={cn(
                  "space-y-2 text-sm",
                  isDark ? "text-zinc-400" : "text-zinc-600"
                )}>
                  <li><a href="#" className="hover:text-emerald-500 transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-emerald-500 transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-emerald-500 transition-colors">Status</a></li>
                  <li><a href="#" className="hover:text-emerald-500 transition-colors">Community</a></li>
                </ul>
              </div>
            </div>
            
            <div className={cn(
              "mt-12 pt-8 border-t text-center text-sm",
              isDark ? "border-zinc-800 text-zinc-400" : "border-zinc-200 text-zinc-600"
            )}>
              <p>&copy; 2024 EzTrack. All rights reserved. Built with ❤️ for productive teams.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
