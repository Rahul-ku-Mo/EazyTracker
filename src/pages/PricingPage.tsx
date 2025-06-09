import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Sparkles, Zap, CheckCircle, ArrowRight, Sun, Moon } from 'lucide-react';
import { useGetPlans } from '@/hooks/useBilling';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeProvider';

const planIcons = {
  free: Zap,
  pro: Sparkles,
  enterprise: Crown,
};

const planColors = {
  free: 'bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700',
  pro: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800',
  enterprise: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800',
};

const PricingPage: React.FC = () => {
  const { data: plans, isLoading } = useGetPlans();
  const { setTheme, isDark } = useTheme();

  const formatPrice = (price: number, currency: string) => {
    const currencySymbol = currency === 'usd' ? '$' : '₹';
    return `${currencySymbol}${price}`;
  };

  return (
    <div className={cn("min-h-screen", isDark ? "bg-zinc-900" : "bg-white")}>
      {/* Header */}
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
              className="flex items-center space-x-2 sm:space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Link to="/" className="hidden sm:block">
                <Button variant="ghost" className="text-sm">
                  Home
                </Button>
              </Link>
              <Link to="/pricing" className="hidden sm:block">
                <Button variant="ghost" className="text-sm text-emerald-600 font-medium">
                  Pricing
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="p-2 w-8 h-8 sm:w-9 sm:h-9 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-300"
                aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: isDark ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="w-4 h-4 sm:w-5 sm:h-5"
                >
                  {isDark ? (
                    <Sun className="w-full h-full text-yellow-500" />
                  ) : (
                    <Moon className="w-full h-full text-slate-600 dark:text-slate-400" />
                  )}
                </motion.div>
              </Button>
              <Link to="/auth" className="hidden sm:block">
                <Button variant="ghost" className="text-sm">
                  Sign In
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
        <div className="container max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Badge className="mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
              Simple, Transparent Pricing
            </Badge>
          </motion.div>
          
          <motion.h1
            className={cn(
              "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6",
              isDark ? "text-white" : "text-zinc-900"
            )}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Choose the Perfect Plan for{' '}
            <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">
              Your Team
            </span>
          </motion.h1>
          
          <motion.p
            className={cn(
              "text-lg sm:text-xl mb-8 max-w-2xl mx-auto",
              isDark ? "text-zinc-300" : "text-zinc-600"
            )}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Start free and scale as you grow. No hidden fees, no surprise charges. 
            Cancel or change plans anytime.
          </motion.p>

          <motion.div
            className={cn(
              "flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm mb-8 sm:mb-12",
              isDark ? "text-zinc-400" : "text-gray-500"
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Free 14-day trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Cancel anytime</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className={cn(
        "py-12 sm:py-16 px-4 sm:px-6",
        isDark ? "bg-zinc-800/50" : "bg-gray-50"
      )}>
        <div className="container max-w-6xl mx-auto">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i} className="relative">
                  <CardHeader>
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-8 w-20" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <Skeleton key={j} className="h-4 w-full" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {plans?.map((plan) => {
                const Icon = planIcons[plan.id as keyof typeof planIcons] || Zap;
                                  const isPro = plan.id === 'pro';
                  const isEnterprise = plan.id === 'enterprise';

                return (
                  <Card
                    key={plan.id}
                    className={cn(
                      'relative transition-all duration-300 hover:shadow-lg',
                      planColors[plan.id as keyof typeof planColors],
                      isPro ? 'ring-2 ring-emerald-500 shadow-lg scale-105' : ''
                    )}
                  >
                    {isPro && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-emerald-500 text-white px-4 py-1">
                          Most Popular
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="text-center pb-6 sm:pb-8">
                      <div className="flex items-center justify-center space-x-2 mb-4">
                        <div className={cn(
                          'w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center',
                          isPro 
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300'
                        )}>
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                      </div>
                      
                      <CardTitle className={cn(
                        "text-xl sm:text-2xl mb-2",
                        isDark ? "text-white" : "text-zinc-900"
                      )}>{plan.name}</CardTitle>
                      <CardDescription className={cn(
                        "mb-4 sm:mb-6 text-sm sm:text-base",
                        isDark ? "text-zinc-400" : "text-zinc-600"
                      )}>
                        {plan.description}
                      </CardDescription>

                      <div className="space-y-1">
                        <div className="flex items-baseline justify-center space-x-1">
                          <span className={cn(
                            "text-3xl sm:text-4xl font-bold",
                            isDark ? "text-white" : "text-zinc-900"
                          )}>
                            {plan.price === 0 ? 'Free' : formatPrice(plan.price, plan.currency)}
                          </span>
                          {plan.price > 0 && (
                            <span className={cn(
                              "text-sm sm:text-base",
                              isDark ? "text-zinc-400" : "text-zinc-500"
                            )}>/{plan.interval}</span>
                          )}
                        </div>
                        {plan.price > 0 && (
                          <p className={cn(
                            "text-xs sm:text-sm",
                            isDark ? "text-zinc-400" : "text-zinc-500"
                          )}>
                            Billed monthly, cancel anytime
                          </p>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span className={cn(
                              isDark ? "text-zinc-300" : "text-zinc-700"
                            )}>{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className={cn(
                        "pt-6 border-t",
                        isDark ? "border-zinc-700" : "border-gray-200"
                      )}>
                        {plan.id === 'free' ? (
                          <Link to="/auth" className="block">
                            <Button className="w-full h-10 sm:h-12 text-sm sm:text-lg" variant="outline">
                              Start Free Trial
                            </Button>
                          </Link>
                        ) : (
                          <Link to="/auth" className="block">
                            <Button className={cn(
                              "w-full h-10 sm:h-12 text-sm sm:text-lg",
                              isPro 
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                                : isEnterprise
                                ? "bg-purple-600 hover:bg-purple-700 text-white"
                                : "bg-gray-900 hover:bg-gray-800 text-white"
                            )}>
                              Start Free Trial
                              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                            </Button>
                          </Link>
                        )}
                        <p className={cn(
                          "text-xs text-center mt-3",
                          isDark ? "text-zinc-400" : "text-zinc-500"
                        )}>
                          14-day free trial • No credit card required
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className={cn(
              "text-2xl sm:text-3xl font-bold mb-4",
              isDark ? "text-white" : "text-zinc-900"
            )}>
              Frequently Asked Questions
            </h2>
            <p className={cn(
              "text-sm sm:text-base",
              isDark ? "text-zinc-300" : "text-zinc-600"
            )}>
              Everything you need to know about our pricing and plans.
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2">
            <div>
              <h3 className={cn(
                "font-semibold mb-2",
                isDark ? "text-white" : "text-zinc-900"
              )}>
                Can I change plans anytime?
              </h3>
              <p className={cn(
                isDark ? "text-zinc-300" : "text-zinc-600"
              )}>
                Yes! You can upgrade, downgrade, or cancel your plan at any time. 
                Changes take effect at your next billing cycle.
              </p>
            </div>
            
            <div>
              <h3 className={cn(
                "font-semibold mb-2",
                isDark ? "text-white" : "text-zinc-900"
              )}>
                Is there a free trial?
              </h3>
              <p className={cn(
                isDark ? "text-zinc-300" : "text-zinc-600"
              )}>
                Absolutely! We offer a 14-day free trial with full access to Pro features. 
                No credit card required to start.
              </p>
            </div>
            
            <div>
              <h3 className={cn(
                "font-semibold mb-2",
                isDark ? "text-white" : "text-zinc-900"
              )}>
                What payment methods do you accept?
              </h3>
              <p className={cn(
                isDark ? "text-zinc-300" : "text-zinc-600"
              )}>
                We accept all major credit cards (Visa, MasterCard, American Express) 
                through our secure Stripe integration.
              </p>
            </div>
            
            <div>
              <h3 className={cn(
                "font-semibold mb-2",
                isDark ? "text-white" : "text-zinc-900"
              )}>
                Do you offer discounts for teams?
              </h3>
              <p className={cn(
                isDark ? "text-zinc-300" : "text-zinc-600"
              )}>
                Yes! Contact us for volume discounts on teams with 50+ members. 
                We also offer special pricing for nonprofits and educational institutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-emerald-600">
        <div className="container max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-emerald-100 text-base sm:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto">
            Experience the next generation of project management designed for modern teams. 
            Start your free trial today.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-white text-emerald-600 hover:bg-gray-50 h-10 sm:h-12 px-6 sm:px-8 text-sm sm:text-base">
                Start Free Trial
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={cn(
        "py-12 sm:py-16 border-t",
        isDark ? "bg-zinc-900 border-zinc-800" : "bg-zinc-50 border-zinc-200"
      )}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="col-span-1 sm:col-span-2 lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <span className={cn(
                  "text-xl font-bold",
                  isDark ? "text-white" : "text-zinc-900"
                )}>
                  PulseBoard
                </span>
              </div>
              <p className={cn(
                "mb-6 max-w-md text-sm sm:text-base",
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
    </div>
  );
};

export default PricingPage; 