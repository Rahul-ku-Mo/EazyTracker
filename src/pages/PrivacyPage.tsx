import { motion } from 'framer-motion';
import { Shield, Eye, Lock, Database, Mail, Cookie, Globe } from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';
import { cn } from '@/lib/utils';
import PublicPageHeader from '@/components/shared/PublicPageHeader';
import PublicPageFooter from '@/components/shared/PublicPageFooter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PrivacyPage: React.FC = () => {
  const { isDark } = useTheme();

  const sections = [
    {
      id: "overview",
      title: "1. Privacy Overview",
      icon: Eye,
      content: `At PulseBoard, we take your privacy seriously. This Privacy Policy explains how we collect, use, protect, and share your personal information when you use our project management platform. We are committed to transparency and giving you control over your data.`
    },
    {
      id: "information-collection",
      title: "2. Information We Collect",
      icon: Database,
      content: `We collect information you provide directly (account details, profile information, project data), information collected automatically (usage analytics, device information, IP addresses), and information from third parties (OAuth providers like Google for authentication). All data collection is essential for providing our services.`
    },
    {
      id: "data-usage",
      title: "3. How We Use Your Information",
      icon: Lock,
      content: `We use your information to: provide and improve our services, process payments, send important notifications, provide customer support, analyze usage patterns to enhance user experience, and ensure platform security. We never sell your personal data to third parties.`
    },
    {
      id: "data-sharing",
      title: "4. Information Sharing and Disclosure",
      content: `We only share your information in limited circumstances: with your explicit consent, with service providers who help us operate (under strict confidentiality agreements), to comply with legal obligations, to protect our rights and safety, or in connection with business transfers. We never share your project data or personal information for marketing purposes.`
    },
    {
      id: "data-security",
      title: "5. Data Security and Protection",
      icon: Shield,
      content: `We implement industry-standard security measures including data encryption in transit and at rest, secure data centers, regular security audits, access controls and authentication, and employee security training. While no system is 100% secure, we continuously work to protect your information.`
    },
    {
      id: "data-retention",
      title: "6. Data Retention and Deletion",
      content: `We retain your personal information for as long as your account is active or as needed to provide services. Project data is retained according to your subscription plan. You can delete your account and request data deletion at any time. We may retain some information for legal compliance, but will anonymize it where possible.`
    },
    {
      id: "cookies",
      title: "7. Cookies and Tracking Technologies",
      icon: Cookie,
      content: `We use cookies and similar technologies to enhance your experience, remember your preferences, analyze site usage, and provide personalized content. You can control cookie settings through your browser. Essential cookies are required for basic functionality and cannot be disabled.`
    },
    {
      id: "international-transfers",
      title: "8. International Data Transfers",
      icon: Globe,
      content: `Your data may be transferred to and processed in countries other than your residence. We ensure appropriate safeguards are in place for international transfers, including standard contractual clauses and adequacy decisions. Your data is primarily stored in secure data centers in India.`
    },
    {
      id: "user-rights",
      title: "9. Your Privacy Rights",
      content: `You have the right to: access your personal information, correct inaccurate data, delete your account and data, export your data, restrict certain processing, object to data processing, and withdraw consent. For EU residents, you also have rights under GDPR. Contact us to exercise these rights.`
    },
    {
      id: "children-privacy",
      title: "10. Children's Privacy",
      content: `PulseBoard is not intended for children under 16. We do not knowingly collect personal information from children under 16. If we learn that we have collected information from a child under 16, we will delete it promptly. Parents who believe their child has provided information should contact us.`
    },
    {
      id: "changes",
      title: "11. Changes to Privacy Policy",
      content: `We may update this Privacy Policy from time to time. We will notify you of any material changes via email or through our platform. We encourage you to review this policy periodically. Your continued use of PulseBoard after changes indicates acceptance of the updated policy.`
    },
    {
      id: "contact",
      title: "12. Contact Information",
      content: `If you have any questions about this Privacy Policy or our data practices, please contact our Data Protection Officer at support@pulseboard.co.in. We are committed to resolving any privacy concerns promptly and transparently.`
    }
  ];

  const dataTypes = [
    {
      category: "Account Information",
      examples: "Name, email address, password, profile picture, company details",
      purpose: "Account creation, authentication, personalization"
    },
    {
      category: "Project Data", 
      examples: "Kanban boards, tasks, comments, time tracking, file attachments",
      purpose: "Service functionality, collaboration, data synchronization"
    },
    {
      category: "Usage Analytics",
      examples: "Page views, feature usage, performance metrics, error logs",
      purpose: "Service improvement, troubleshooting, optimization"
    },
    {
      category: "Device Information",
      examples: "IP address, browser type, operating system, device identifiers",
      purpose: "Security, compatibility, fraud prevention"
    },
    {
      category: "Communication Data",
      examples: "Support tickets, feedback, survey responses",
      purpose: "Customer support, product development, relationship management"
    }
  ];

  return (
    <div className={cn("min-h-screen", isDark ? "bg-zinc-900" : "bg-white")}>
      <PublicPageHeader />
      
      <div className="pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6">
        <div className="container max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mr-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className={cn(
                "text-3xl sm:text-4xl md:text-5xl font-bold",
                isDark ? "text-white" : "text-zinc-900"
              )}>
                Privacy Policy
              </h1>
            </div>
            
            <p className={cn(
              "text-lg sm:text-xl max-w-3xl mx-auto mb-6",
              isDark ? "text-zinc-300" : "text-zinc-600"
            )}>
              Your privacy is important to us. This policy explains how we collect, use, 
              and protect your personal information when you use PulseBoard.
            </p>

            <Alert className="max-w-2xl mx-auto border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20">
              <AlertDescription className="text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
              <Shield className="size-4 text-emerald-600" />
                <strong>Last Updated:</strong> June 5, 2025. We are GDPR compliant and committed to data protection.
              </AlertDescription>
            </Alert>
          </motion.div>

          {/* Data Collection Overview */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className={cn(
              "shadow-lg",
              isDark ? "border-zinc-800 bg-zinc-900/50" : "border-gray-200 bg-white"
            )}>
              <CardHeader>
                <CardTitle className={cn(
                  "flex items-center space-x-2 text-xl",
                  isDark ? "text-white" : "text-zinc-900"
                )}>
                  <Database className="w-5 h-5 text-emerald-600" />
                  <span>Data Collection Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dataTypes.map((type, index) => (
                    <div key={index} className="space-y-2">
                      <h4 className={cn(
                        "font-semibold text-base",
                        isDark ? "text-emerald-400" : "text-emerald-600"
                      )}>
                        {type.category}
                      </h4>
                      <p className={cn(
                        "text-sm",
                        isDark ? "text-zinc-400" : "text-zinc-500"
                      )}>
                        <strong>Examples:</strong> {type.examples}
                      </p>
                      <p className={cn(
                        "text-sm",
                        isDark ? "text-zinc-300" : "text-zinc-600"
                      )}>
                        <strong>Purpose:</strong> {type.purpose}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Privacy Policy Sections */}
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
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      {section.icon ? (
                        <section.icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      )}
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

          {/* Contact and Rights Information */}
          <motion.div
            className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8"
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
                  <span>Contact Us</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-emerald-700 dark:text-emerald-300 mb-4">
                  Questions about privacy or data protection?
                </p>
                <div className="space-y-2 text-emerald-600 dark:text-emerald-400">
                  <p><strong>Email:</strong> <a href="mailto:support@pulseboard.co.in" className="underline hover:no-underline">support@pulseboard.co.in</a></p>
                  <p><strong>Subject Line:</strong> "Privacy Policy Question"</p>
                  <p><strong>Response Time:</strong> Within 48 hours</p>
                </div>
              </CardContent>
            </Card>

            <Card className={cn(
              "shadow-lg border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
            )}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-700 dark:text-blue-400">
                  <Lock className="w-5 h-5" />
                  <span>Exercise Your Rights</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-700 dark:text-blue-300 mb-4">
                  Access, correct, or delete your data:
                </p>
                <div className="space-y-2 text-blue-600 dark:text-blue-400 text-sm">
                  <p>• <strong>Account Settings:</strong> Update profile information</p>
                  <p>• <strong>Data Export:</strong> Download your project data</p>
                  <p>• <strong>Account Deletion:</strong> Permanently delete account</p>
                  <p>• <strong>Email Us:</strong> For specific data requests</p>
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

export default PrivacyPage; 