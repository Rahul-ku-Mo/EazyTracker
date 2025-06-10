import { motion } from "framer-motion";
import {
  Sparkles,
  Shield,
  Zap,
  CheckCircle,
  Bell,
  MessageSquare,
  Calendar,
  FileText,
  Palette,
  Bot,
  GitBranch,
  Timer,
  Play,
  Rocket,
  Check,
} from "lucide-react";
  import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeProvider";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";

import { Badge } from "../components/ui/badge";
import { ContainerScroll } from "@/utils/container-scroll";

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
  const { isDark } = useTheme();

  return (
    <div
      className={cn(
        "min-h-screen relative overflow-hidden transition-colors duration-700 ease-out",
        isDark ? "bg-zinc-950" : "bg-white"
      )}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={cn(
            "absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl transition-opacity duration-700",
            isDark ? "opacity-10" : "opacity-20",
            "bg-gradient-to-br from-emerald-400 to-cyan-400"
          )}
        />
        <div
          className={cn(
            "absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl transition-opacity duration-700",
            isDark ? "opacity-10" : "opacity-20",
            "bg-gradient-to-tr from-emerald-400 to-blue-400"
          )}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header 
          className={cn(
            "fixed top-0 left-0 right-0 z-50",
            "transition-all duration-700 ease-out",
            "backdrop-blur-xl backdrop-saturate-150",
            isDark 
              ? "bg-zinc-950/80 border-b border-zinc-800/50" 
              : "bg-white/80 border-b border-zinc-200/50"
          )}
          style={{
            backdropFilter: "blur(20px) saturate(150%)",
            WebkitBackdropFilter: "blur(20px) saturate(150%)"
          }}
        >
          <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex items-center justify-between">
              <motion.div
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <img 
                  src="/landing-page.svg" 
                  alt="PulseBoard Logo" 
                  className="h-12 w-auto"
                />
              </motion.div>

              <motion.div
                className="flex items-center space-x-2 sm:space-x-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Link to="/pricing" className="hidden sm:block">
                  <Button variant="ghost" className="text-sm">
                    Pricing
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 text-xs sm:text-sm px-3 sm:px-4">
                    Get Started
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6">
          <div className="container mx-auto max-w-7xl">
            <motion.div
              className=""
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="mb-6 text-center max-w-4xl mx-auto"
              >
                <Badge className="mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                  🚀 New: Real-time notifications now live!
                </Badge>
              </motion.div>

              <motion.h1
                className={cn(
                  "text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight text-center max-w-4xl mx-auto",
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
                  "text-lg sm:text-xl md:text-2xl mb-8 font-medium leading-relaxed max-w-3xl mx-auto text-center",
                  isDark ? "text-zinc-300" : "text-zinc-600"
                )}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              >
                Transform your team's productivity with intelligent task
                management, real-time collaboration, and powerful analytics.
                Everything you need to deliver projects faster.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              >
                <Link to="/auth" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 text-base sm:text-lg px-6 sm:px-8 py-3 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 ease-out"
                  >
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Start Free Trial
                  </Button>
                </Link>
                <Link to="/auth" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 h-auto rounded-xl border-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-500 ease-out"
                  >
                    <Rocket className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Sign In
                  </Button>
                </Link>
              </motion.div>

              <ContainerScroll>
                <img
                  src={isDark ? "/Kanban-dark.png" : "/kanban-light.png"}
                  alt="PulseBoard Dashboard - Kanban View"
                  height={720}
                  width={1400}
                  className="mx-auto object-contain h-full"
                  draggable={false}
                />
              </ContainerScroll>
            </motion.div>
          </div>
        </section>

        {/* Core Features Section */}
        <section className="py-16 sm:py-20 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div
              className="text-center mb-12 sm:mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <Badge className="mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                Core Features
              </Badge>
              <h2
                className={cn(
                  "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4",
                  isDark ? "text-white" : "text-zinc-900"
                )}
              >
                Everything You Need to{" "}
                <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                  Succeed
                </span>
              </h2>
              <p
                className={cn(
                  "text-lg sm:text-xl max-w-2xl mx-auto",
                  isDark ? "text-zinc-300" : "text-zinc-600"
                )}
              >
                Powerful features designed to streamline your workflow and boost
                team productivity.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {[
                {
                  icon: CheckCircle,
                  title: "Kanban Boards",
                  description:
                    "Visual task management with custom columns. Card completion tracking with Linear-style checkboxes. Sort and organize your workflow.",
                  gradient: "from-emerald-500 to-teal-500",
                },
                {
                  icon: Bell,
                  title: "Real-time Notifications",
                  description:
                    "Instant alerts for card assignments. Updates and comments notifications. Overdue and due-soon reminders.",
                  gradient: "from-blue-500 to-cyan-500",
                },
                {
                  icon: Timer,
                  title: "Time Tracking",
                  description:
                    "Built-in timer for accurate tracking. Session management with pause/resume. Automatic time calculations per card.",
                  gradient: "from-purple-500 to-pink-500",
                },
                {
                  icon: Bot,
                  title: "AI Assistant",
                  description:
                    "Smart writing improvements. Content optimization. AI-powered conversations and assistance for your projects.",
                  gradient: "from-orange-500 to-red-500",
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className={cn(
                    "group relative p-6 sm:p-8 rounded-2xl border-2 border-transparent transition-all duration-300",
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
                  <div
                    className={cn(
                      "w-12 h-12 sm:w-16 sm:h-16 rounded-xl mb-4 sm:mb-6 flex items-center justify-center",
                      `bg-gradient-to-br ${feature.gradient}`,
                      "shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                    )}
                  >
                    <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3
                    className={cn(
                      "text-lg sm:text-xl font-bold mb-3",
                      isDark ? "text-white" : "text-zinc-900"
                    )}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className={cn(
                      "text-sm leading-relaxed",
                      isDark ? "text-zinc-400" : "text-zinc-600"
                    )}
                  >
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Advanced Features Grid */}
        {/* <section className="py-24 bg-zinc-50 dark:bg-zinc-900/50">
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
              <h2
                className={cn(
                  "text-4xl md:text-5xl font-bold mb-4",
                  isDark ? "text-white" : "text-zinc-900"
                )}
              >
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
                  description:
                    "Team performance metrics. Sprint velocity tracking. Completion rate analytics. Time distribution insights.",
                },
                {
                  icon: Users,
                  title: "Team Management",
                  description:
                    "Role-based access control. Board permissions system. Team member onboarding. Activity monitoring.",
                },
                {
                  icon: MessageSquare,
                  title: "Collaboration",
                  description:
                    "Real-time card comments. Team discussions. Activity tracking. Seamless teamwork features.",
                },
                {
                  icon: Calendar,
                  title: "Due Date Management",
                  description:
                    "Visual due date indicators. Automatic overdue detection. Smart deadline reminders. Priority-based sorting.",
                },
                {
                  icon: Target,
                  title: "Priority System",
                  description:
                    "Color-coded priority levels. Urgency-based sorting. Visual priority indicators. Focus on what matters most.",
                },
                {
                  icon: Palette,
                  title: "Dark/Light Themes",
                  description:
                    "Beautiful dark and light mode support. Consistent design system. Comfortable viewing in any environment.",
                },
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
                  <h3
                    className={cn(
                      "text-lg font-semibold mb-2",
                      isDark ? "text-white" : "text-zinc-900"
                    )}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className={cn(
                      "text-sm",
                      isDark ? "text-zinc-400" : "text-zinc-600"
                    )}
                  >
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section> */}

        {/* Apple-Style Features Grid */}
        <section className="py-24 bg-white dark:bg-zinc-950">
          <div className="container mx-auto px-6">
            <motion.div
              className="text-center mb-20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <Badge className="mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                Built for Modern Teams
              </Badge>
              <h2
                className={cn(
                  "text-4xl md:text-5xl lg:text-6xl font-bold mb-6",
                  isDark ? "text-white" : "text-zinc-900"
                )}
              >
                Every detail{" "}
                <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                  crafted for performance
                </span>
              </h2>
              <p
                className={cn(
                  "text-xl max-w-3xl mx-auto",
                  isDark ? "text-zinc-300" : "text-zinc-600"
                )}
              >
                Experience enterprise-grade project management with the simplicity your team deserves.
              </p>
            </motion.div>

            {/* Feature Grid - Apple Style */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
              
              {/* Kanban Boards */}
              <motion.div
                className={cn(
                  "group relative rounded-3xl overflow-hidden",
                  "bg-gradient-to-br from-emerald-50 to-teal-50",
                  "dark:from-emerald-950/30 dark:to-teal-950/30",
                  "border border-emerald-100 dark:border-emerald-800/30",
                  "hover:shadow-2xl transition-all duration-700",
                  "p-8 lg:p-12"
                )}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <div className="relative z-10 space-y-6">
                  <div className="space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className={cn(
                        "text-2xl font-bold mb-3",
                        isDark ? "text-white" : "text-zinc-900"
                      )}>
                        Kanban Boards
                      </h3>
                      <p className={cn(
                        "text-lg leading-relaxed",
                        isDark ? "text-zinc-300" : "text-zinc-600"
                      )}>
                        Work efficiently with instant access to common actions.
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl blur-2xl"></div>
                    <img
                      src={isDark ? "/Kanban-dark.png" : "/kanban-light.png"}
                      alt="Kanban Boards Interface"
                      className="relative w-full rounded-2xl shadow-xl border border-white/50 dark:border-zinc-700/50"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Team Planner */}
              <motion.div
                className={cn(
                  "group relative rounded-3xl overflow-hidden",
                  "bg-gradient-to-br from-blue-50 to-cyan-50",
                  "dark:from-blue-950/30 dark:to-cyan-950/30",
                  "border border-blue-100 dark:border-blue-800/30",
                  "hover:shadow-2xl transition-all duration-700",
                  "p-8 lg:p-12"
                )}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <div className="relative z-10 space-y-6">
                  <div className="space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                      <Calendar className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className={cn(
                        "text-2xl font-bold mb-3",
                        isDark ? "text-white" : "text-zinc-900"
                      )}>
                        Team Planner
                      </h3>
                      <p className={cn(
                        "text-lg leading-relaxed",
                        isDark ? "text-zinc-300" : "text-zinc-600"
                      )}>
                        Keep track of the bigger picture by viewing all individual tasks in one centralized team calendar.
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl blur-2xl"></div>
                    <img
                      src={isDark ? "/team-management-dark.png" : "/team-management-light.png"}
                      alt="Team Planner Interface"
                      className="relative w-full rounded-2xl shadow-xl border border-white/50 dark:border-zinc-700/50"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Time Tracking */}
              <motion.div
                className={cn(
                  "group relative rounded-3xl overflow-hidden",
                  "bg-gradient-to-br from-purple-50 to-pink-50",
                  "dark:from-purple-950/30 dark:to-pink-950/30",
                  "border border-purple-100 dark:border-purple-800/30",
                  "hover:shadow-2xl transition-all duration-700",
                  "p-8 lg:p-12"
                )}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <div className="relative z-10 space-y-6">
                  <div className="space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <Timer className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className={cn(
                        "text-2xl font-bold mb-3",
                        isDark ? "text-white" : "text-zinc-900"
                      )}>
                        Time-blocking
                      </h3>
                      <p className={cn(
                        "text-lg leading-relaxed",
                        isDark ? "text-zinc-300" : "text-zinc-600"
                      )}>
                        Transform daily tasks into structured time blocks for focused productivity.
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-2xl"></div>
                    <img
                      src={isDark ? "/Team-performance-dark.png" : "/analytics-light.png"}
                      alt="Time Tracking Interface"
                      className="relative w-full rounded-2xl shadow-xl border border-white/50 dark:border-zinc-700/50"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Notifications */}
              <motion.div
                className={cn(
                  "group relative rounded-3xl overflow-hidden",
                  "bg-gradient-to-br from-orange-50 to-red-50",
                  "dark:from-orange-950/30 dark:to-red-950/30",
                  "border border-orange-100 dark:border-orange-800/30",
                  "hover:shadow-2xl transition-all duration-700",
                  "p-8 lg:p-12"
                )}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <div className="relative z-10 space-y-6">
                  <div className="space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                      <Bell className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className={cn(
                        "text-2xl font-bold mb-3",
                        isDark ? "text-white" : "text-zinc-900"
                      )}>
                        Notifications
                      </h3>
                      <p className={cn(
                        "text-lg leading-relaxed",
                        isDark ? "text-zinc-300" : "text-zinc-600"
                      )}>
                        Keep up to date with any changes by receiving instant notifications.
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl blur-2xl"></div>
                    <img
                      src={isDark ? "/inbox-notification.png" : "/inbox-notification-light.png"}
                      alt="Notifications System"
                      className="relative w-full rounded-2xl shadow-xl border border-white/50 dark:border-zinc-700/50"
                    />
                  </div>
                </div>
              </motion.div>
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
              <h2
                className={cn(
                  "text-4xl md:text-5xl font-bold mb-4",
                  isDark ? "text-white" : "text-zinc-900"
                )}
              >
                Exciting Features on the{" "}
                <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                  Roadmap
                </span>
              </h2>
              <p
                className={cn(
                  "text-xl max-w-2xl mx-auto",
                  isDark ? "text-zinc-300" : "text-zinc-600"
                )}
              >
                We're constantly improving PulseBoard. Here's what's coming
                next.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: GitBranch,
                  title: "Drag & Drop",
                  description: "Intuitive drag-and-drop for cards and columns",
                },
                {
                  icon: MessageSquare,
                  title: "@Mentions & Threads",
                  description: "Tag team members and threaded discussions",
                },
                {
                  icon: FileText,
                  title: "File Attachments",
                  description: "Upload and attach files directly to cards",
                },
                {
                  icon: Zap,
                  title: "Workflow Automation",
                  description: "Automate repetitive tasks and processes",
                },
                {
                  icon: Calendar,
                  title: "Calendar View",
                  description: "Timeline and calendar view for better planning",
                },
                {
                  icon: Palette,
                  title: "Custom Themes",
                  description: "Personalized layouts and board colors",
                },
                {
                  icon: Sparkles,
                  title: "Smart Suggestions",
                  description: "AI-powered workflow recommendations",
                },
                {
                  icon: Shield,
                  title: "Advanced Security",
                  description: "SSO, audit logs, and enterprise features",
                },
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
                    <h3
                      className={cn(
                        "font-semibold mb-2",
                        isDark ? "text-white" : "text-zinc-900"
                      )}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className={cn(
                        "text-xs mb-4",
                        isDark ? "text-zinc-400" : "text-zinc-600"
                      )}
                    >
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
        <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-cyan-600" />
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent"></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <motion.div
              className="text-center max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6">
                Ready to Transform Your
                <br className="hidden sm:block" />
                <span className="text-emerald-100">Project Management?</span>
              </h2>
              <p className="text-lg sm:text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
                Experience the next generation of project management designed
                for modern teams. Start your free trial today.
              </p>

              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 sm:mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Link to="/auth" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-white text-emerald-600 hover:bg-emerald-50 border-0 text-base sm:text-lg px-6 sm:px-8 py-3 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                  >
                    <Rocket className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Start Your Free Trial
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-emerald-100"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm">No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm">14-day free trial</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm">Cancel anytime</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer
          className={cn(
            "py-12 sm:py-16 border-t",
            isDark
              ? "bg-zinc-900 border-zinc-800"
              : "bg-zinc-50 border-zinc-200"
          )}
        >
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span
                    className={cn(
                      "text-xl font-bold",
                      isDark ? "text-white" : "text-zinc-900"
                    )}
                  >
                    PulseBoard
                  </span>
                </div>
                <p
                  className={cn(
                    "mb-6 max-w-md",
                    isDark ? "text-zinc-400" : "text-zinc-600"
                  )}
                >
                  The ultimate project management experience for modern teams.
                  Built with love and designed for productivity.
                </p>
                <div className="flex space-x-4">
                  {/* Social links can be added here */}
                </div>
              </div>

              <div>
                <h3
                  className={cn(
                    "font-semibold mb-4",
                    isDark ? "text-white" : "text-zinc-900"
                  )}
                >
                  Product
                </h3>
                <ul
                  className={cn(
                    "space-y-2 text-sm",
                    isDark ? "text-zinc-400" : "text-zinc-600"
                  )}
                >
                  <li>
                    <Link
                      to="/pricing"
                      className="hover:text-emerald-500 transition-colors"
                    >
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <span className="line-through opacity-50 cursor-not-allowed">
                      Integrations
                    </span>
                  </li>
                  <li>
                    <span className="line-through opacity-50 cursor-not-allowed">
                      API
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h3
                  className={cn(
                    "font-semibold mb-4",
                    isDark ? "text-white" : "text-zinc-900"
                  )}
                >
                  Support
                </h3>
                <ul
                  className={cn(
                    "space-y-2 text-sm",
                    isDark ? "text-zinc-400" : "text-zinc-600"
                  )}
                >
                  <li>
                    <Link
                      to="/feedback"
                      className="hover:text-emerald-500 transition-colors"
                    >
                      Feedback
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/support"
                      className="hover:text-emerald-500 transition-colors"
                    >
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/terms"
                      className="hover:text-emerald-500 transition-colors"
                    >
                      Terms
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/privacy"
                      className="hover:text-emerald-500 transition-colors"
                    >
                      Privacy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div
              className={cn(
                "mt-12 pt-8 border-t text-center text-sm",
                isDark
                  ? "border-zinc-800 text-zinc-400"
                  : "border-zinc-200 text-zinc-600"
              )}
            >
              <p>
                &copy; 2024 PulseBoard. All rights reserved. Built with ❤️ for
                productive teams.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
