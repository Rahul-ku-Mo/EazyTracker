import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Mail, Calendar, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeProvider';
import { Link } from 'react-router-dom';

const ComingSoonPage = () => {
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

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Logo */}
            <motion.div
              className="flex items-center justify-center space-x-3 mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <span
                className={cn(
                  "text-2xl font-bold",
                  isDark ? "text-white" : "text-zinc-900"
                )}
              >
                PulseBoard
              </span>
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Badge className="mb-6 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                🚀 Launching Soon
              </Badge>
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-6"
            >
              <h1
                className={cn(
                  "text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight",
                  isDark ? "text-white" : "text-zinc-900"
                )}
              >
                We're Almost{" "}
                <span className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-cyan-500 bg-clip-text text-transparent">
                  Ready!
                </span>
              </h1>

              <p
                className={cn(
                  "text-lg sm:text-xl md:text-2xl font-medium leading-relaxed max-w-3xl mx-auto",
                  isDark ? "text-zinc-300" : "text-zinc-600"
                )}
              >
                PulseBoard is preparing for launch! We're finalizing our payment infrastructure 
                and will be live very soon. Get a preview of what's coming on our landing page.
              </p>
            </motion.div>

            {/* Launch Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto mb-8"
            >
              <div className={cn(
                "p-6 rounded-xl border",
                isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
              )}>
                <Mail className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                <h3 className={cn(
                  "font-semibold mb-2",
                  isDark ? "text-white" : "text-zinc-900"
                )}>
                  Payment Setup
                </h3>
                <p className={cn(
                  "text-sm",
                  isDark ? "text-zinc-400" : "text-zinc-600"
                )}>
                  Finalizing Stripe integration
                </p>
              </div>

              <div className={cn(
                "p-6 rounded-xl border",
                isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
              )}>
                <Calendar className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                <h3 className={cn(
                  "font-semibold mb-2",
                  isDark ? "text-white" : "text-zinc-900"
                )}>
                  Launch Date
                </h3>
                <p className={cn(
                  "text-sm",
                  isDark ? "text-zinc-400" : "text-zinc-600"
                )}>
                  Coming very soon
                </p>
              </div>

              <div className={cn(
                "p-6 rounded-xl border",
                isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
              )}>
                <Rocket className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                <h3 className={cn(
                  "font-semibold mb-2",
                  isDark ? "text-white" : "text-zinc-900"
                )}>
                  Features Ready
                </h3>
                <p className={cn(
                  "text-sm",
                  isDark ? "text-zinc-400" : "text-zinc-600"
                )}>
                  100% complete
                </p>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 text-base px-8 py-3 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-500"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Landing Page
                </Button>
              </Link>

              <Link to="/pricing" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-base px-8 py-3 h-auto rounded-xl border-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-500"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  View Pricing
                </Button>
              </Link>
            </motion.div>

            {/* Status Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className={cn(
                "mt-12 p-4 rounded-lg",
                isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-zinc-50 border border-zinc-200"
              )}
            >
              <p className={cn(
                "text-sm",
                isDark ? "text-zinc-400" : "text-zinc-600"
              )}>
                <strong>Status Update:</strong> We're currently waiting for final approval from our payment provider. 
                All features are ready and tested. Launch expected within days!
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonPage; 