import React from 'react';
import { Link } from 'react-router-dom';
// CheckCircle removed - using landing-page.svg instead
import { useTheme } from '@/context/ThemeProvider';
import { cn } from '@/lib/utils';

const PublicPageFooter: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <footer className={cn(
      "py-16 border-t",
      isDark ? "bg-zinc-900 border-zinc-800" : "bg-zinc-50 border-zinc-200"
    )}>
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/landing-page.png" 
                alt="PulseBoard Logo" 
                className="h-8 w-auto"
              />
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
                <li><Link to="/pricing" className="hover:text-emerald-500 transition-colors">Pricing</Link></li>
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
              <li><Link to="/support" className="hover:text-emerald-500 transition-colors">Help Center</Link></li>
              <li><Link to="/support" className="hover:text-emerald-500 transition-colors">Contact</Link></li>
              <li><Link to="/feedback" className="hover:text-emerald-500 transition-colors">Feedback</Link></li>
              <li><Link to="/terms" className="hover:text-emerald-500 transition-colors">Terms</Link></li>
              <li><Link to="/privacy" className="hover:text-emerald-500 transition-colors">Privacy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className={cn(
          "mt-12 pt-8 border-t text-center text-sm",
          isDark ? "border-zinc-800 text-zinc-400" : "border-zinc-200 text-zinc-600"
        )}>
          <p>&copy; 2024 PulseBoard. All rights reserved. Built with ❤️ for productive teams.</p>
        </div>
      </div>
    </footer>
  );
};

export default PublicPageFooter; 