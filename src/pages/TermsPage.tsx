import { motion } from 'framer-motion';
import { Scroll, AlertTriangle, CheckCircle, Mail } from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';
import { cn } from '@/lib/utils';
import PublicPageHeader from '@/components/shared/PublicPageHeader';
import PublicPageFooter from '@/components/shared/PublicPageFooter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const TermsPage: React.FC = () => {
  const { isDark } = useTheme();

  const sections = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      content: `By accessing and using PulseBoard ("Service", "Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`
    },
    {
      id: "description",
      title: "2. Service Description",
      content: `PulseBoard is a cloud-based project management platform that provides Kanban boards, time tracking, team collaboration tools, analytics, and AI-powered insights. The service is provided on a subscription basis with various plan tiers.`
    },
    {
      id: "eligibility",
      title: "3. Eligibility and Account Registration",
      content: `You must be at least 16 years old to use PulseBoard. When creating an account, you must provide accurate and complete information. You are responsible for maintaining the security of your account credentials and for all activities that occur under your account.`
    },
    {
      id: "acceptable-use",
      title: "4. Acceptable Use Policy",
      content: `You agree not to use PulseBoard to: (a) violate any laws or regulations, (b) infringe on intellectual property rights, (c) transmit harmful or malicious content, (d) attempt to gain unauthorized access to our systems, (e) interfere with other users' use of the service, or (f) use the service for any illegal or unauthorized purpose.`
    },
    {
      id: "subscription",
      title: "5. Subscription and Billing",
      content: `PulseBoard offers free and paid subscription plans. Paid subscriptions are billed in advance on a monthly or annual basis. You authorize us to charge your payment method for all fees. Subscription fees are non-refundable except as required by law or as explicitly stated in these terms.`
    },
    {
      id: "data-ownership",
      title: "6. Data Ownership and Privacy",
      content: `You retain ownership of all data you upload to PulseBoard. We provide tools for you to export your data at any time. We collect and process your data in accordance with our Privacy Policy. We implement industry-standard security measures to protect your data.`
    },
    {
      id: "intellectual-property",
      title: "7. Intellectual Property Rights",
      content: `PulseBoard and its original content, features, and functionality are owned by PulseBoard Team and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.`
    },
    {
      id: "termination",
      title: "8. Account Termination",
      content: `You may terminate your account at any time through your account settings. We may terminate or suspend your account immediately if you breach these terms. Upon termination, your right to use the service ceases immediately, and we may delete your data after a reasonable grace period.`
    },
    {
      id: "limitation",
      title: "9. Limitation of Liability",
      content: `PulseBoard shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service. Our total liability shall not exceed the amount you paid for the service in the 12 months preceding the claim.`
    },
    {
      id: "availability",
      title: "10. Service Availability",
      content: `We strive to provide reliable service but cannot guarantee 100% uptime. We may temporarily suspend the service for maintenance, updates, or other operational reasons. We will provide advance notice when possible.`
    },
    {
      id: "modifications",
      title: "11. Modifications to Terms",
      content: `We reserve the right to modify these terms at any time. We will notify users of material changes via email or through the platform. Your continued use of PulseBoard after changes constitutes acceptance of the new terms.`
    },
    {
      id: "governing-law",
      title: "12. Governing Law and Jurisdiction",
      content: `These terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be resolved in the courts of India. If any provision of these terms is found to be unenforceable, the remaining provisions shall remain in full force.`
    }
  ];

  return (
    <div className={cn("min-h-screen", isDark ? "bg-zinc-900" : "bg-white")}>
      <PublicPageHeader />
      
      <div className="pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6">
        <div className="container max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mr-4">
                <Scroll className="w-8 h-8 text-white" />
              </div>
              <h1 className={cn(
                "text-3xl sm:text-4xl md:text-5xl font-bold",
                isDark ? "text-white" : "text-zinc-900"
              )}>
                Terms & Conditions
              </h1>
            </div>
            
            <p className={cn(
              "text-lg sm:text-xl max-w-3xl mx-auto mb-6",
              isDark ? "text-zinc-300" : "text-zinc-600"
            )}>
              Please read these terms and conditions carefully before using PulseBoard. 
              These terms govern your use of our platform and services.
            </p>

            <Alert className="max-w-2xl mx-auto border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
              <AlertDescription className="text-amber-800 dark:text-amber-400 flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-600" />
                <strong>Last Updated:</strong> June 5, 2025. By using PulseBoard, you agree to these terms.
              </AlertDescription>
            </Alert>
          </motion.div>

          {/* Terms Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {sections.map((section) => (
              <Card key={section.id} className={cn(
                "shadow-lg transition-all duration-300 hover:shadow-xl",
                isDark ? "border-zinc-800 bg-zinc-900/50" : "border-gray-200 bg-white"
              )}>
                <CardHeader className="pb-4">
                  <CardTitle className={cn(
                    "flex items-start space-x-3 text-xl font-semibold",
                    isDark ? "text-white" : "text-zinc-900"
                  )}>
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0git stat">
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span>{section.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={cn(
                    "leading-relaxed text-base",
                    isDark ? "text-zinc-300" : "text-zinc-600"
                  )}>
                    {section.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Contact Information */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className={cn(
              "shadow-lg border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20"
            )}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400">
                  <Mail className="w-5 h-5" />
                  <span>Questions About These Terms?</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-emerald-700 dark:text-emerald-300 mb-4">
                  If you have any questions about these Terms and Conditions, please contact us:
                </p>
                <div className="space-y-2 text-emerald-600 dark:text-emerald-400">
                  <p><strong>Email:</strong> <a href="mailto:support@pulseboard.co.in" className="underline hover:no-underline">support@pulseboard.co.in</a></p>
                  <p><strong>Website:</strong> <a href="https://www.pulseboard.co.in" className="underline hover:no-underline">www.pulseboard.co.in</a></p>
                 
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      
      <PublicPageFooter />
    </div>
  );
};

export default TermsPage; 