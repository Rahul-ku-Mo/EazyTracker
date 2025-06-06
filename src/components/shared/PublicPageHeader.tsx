import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeProvider';
import { cn } from '@/lib/utils';

const PublicPageHeader: React.FC = () => {
  const { setTheme, isDark } = useTheme();

  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className={cn(
                "text-lg sm:text-xl font-bold",
                isDark ? "text-white" : "text-zinc-900"
              )}>
                PulseBoard
              </span>
            </Link>
          </motion.div>

          <motion.div
            className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link to="/" className="hidden lg:block">
              <Button variant="ghost" className="text-sm">
                Home
              </Button>
            </Link>
            <Link to="/pricing" className="hidden md:block">
              <Button variant="ghost" className="text-sm">
                Pricing
              </Button>
            </Link>
            {/* <Link to="/support" className="hidden sm:block">
              <Button variant="ghost" className="text-sm">
                Support
              </Button>
            </Link>
            <Link to="/feedback" className="hidden sm:block">
              <Button variant="ghost" className="text-sm">
                Feedback
              </Button>
            </Link> */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="p-2 w-8 h-8 sm:w-9 sm:h-9 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-300"
              aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            >
              <motion.div
                initial={false}
                animate={{ opacity: isDark ? 1 : 1 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center"
              >
                {isDark ? (
                  <Sun className="w-full h-full text-yellow-500 sm:size-5 size-4" />
                ) : (
                  <Moon className="w-full h-full text-slate-600 dark:text-slate-400 sm:size-5 size-4" />
                )}
              </motion.div>
            </Button>
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 text-xs sm:text-sm px-3 sm:px-4">
                Get Started
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </header>
  );
};

export default PublicPageHeader; 