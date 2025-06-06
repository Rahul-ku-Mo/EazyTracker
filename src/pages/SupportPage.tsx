import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
//import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Mail, 
  //MessageCircle, 
  //Phone, 
  Clock, 
  Send, 
  HelpCircle,
  Zap,
 // Shield,
  Headphones,
  //Globe,
  //Calendar,
  //FileText,
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeProvider';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import PublicPageHeader from '@/components/shared/PublicPageHeader';
import PublicPageFooter from '@/components/shared/PublicPageFooter';

interface ContactFormData {
  name: string;
  email: string;
  description: string;
}

const SupportPage: React.FC = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('contact');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Your message has been sent! We\'ll get back to you within 24 hours.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        description: '',
      });
    } catch (error : any) {
      toast.error('Failed to send message. Please try again.');
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof ContactFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const faqData = [
    {
      question: "How do I get started with PulseBoard?",
      answer: "Getting started is easy! Sign up for a free account, complete the onboarding process, and you can immediately start creating projects and inviting team members. Our 14-day free trial gives you full access to all premium features."
    },
    {
      question: "Can I upgrade or downgrade my plan anytime?",
      answer: "Absolutely! You can change your plan at any time from the billing section. Upgrades take effect immediately, while downgrades will take effect at your next billing cycle. You'll always have access to your current plan features until the period ends."
    },
    {
      question: "Is my data secure with PulseBoard?",
      answer: "Yes, we take security very seriously. All data is encrypted in transit and at rest using industry-standard encryption. We're SOC 2 compliant and regularly undergo security audits. Your data is backed up daily and stored in secure, geographically distributed data centers."
    },
    {
      question: "How do I invite team members?",
      answer: "You can invite team members from the team management section in your workspace. Simply enter their email addresses and they'll receive an invitation to join your team. You can also set their role and permissions during the invitation process."
    },
    {
      question: "What happens if I exceed my plan limits?",
      answer: "If you approach your plan limits, we'll notify you in advance. For team members and projects, you'll need to upgrade to add more. For storage, we provide a grace period before requiring an upgrade. You can always monitor your usage in the billing section."
    },
    {
      question: "Can I export my data?",
      answer: "Yes, you can export all your data at any time. We support exports in various formats including CSV, JSON, and PDF. This ensures you always have access to your data and can migrate if needed."
    },
    {
      question: "How do I cancel my subscription?",
      answer: "You can cancel your subscription anytime from the billing section. Your account will remain active until the end of your current billing period, and you'll continue to have access to all features until then."
    }
  ];

  const supportChannels = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get detailed help via email",
      details: "support@pulseboard.com",
      responseTime: "Within 2-4 hours",
      availability: "24/7",
      color: "text-emerald-600"
    },
    // {
    //   icon: MessageCircle,
    //   title: "Live Chat",
    //   description: "Chat with our support team",
    //   details: "Available in app",
    //   responseTime: "Instant",
    //   availability: "Mon-Fri, 9 AM - 6 PM EST",
    //   color: "text-green-600"
    // },
    // {
    //   icon: Phone,
    //   title: "Phone Support",
    //   description: "Speak directly with our team",
    //   details: "+1 (555) 123-4567",
    //   responseTime: "Immediate",
    //   availability: "Business hours only",
    //   color: "text-purple-600"
    // }
  ];

  return (
    <div className={cn("min-h-screen", isDark ? "bg-zinc-900" : "bg-white")}>
      <PublicPageHeader />
      
      <div className="pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6">
        <div className="container max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className={cn(
            "text-2xl sm:text-3xl md:text-4xl font-bold mb-4",
            isDark ? "text-white" : "text-zinc-900"
          )}>
            How Can We{' '}
            <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">
              Help You?
            </span>
          </h1>
          <p className={cn(
            "text-lg sm:text-xl max-w-2xl mx-auto mb-6",
            isDark ? "text-zinc-300" : "text-zinc-600"
          )}>
            We're here to help you succeed with PulseBoard. Your questions and feedback 
            are our top priority.
          </p>
          
          <Alert className="max-w-2xl mx-auto border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20">
            <Zap className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-800 dark:text-emerald-400">
              <strong>Priority Support:</strong> All support requests are treated with utmost importance. 
              We prioritize based on the subject matter and will respond as quickly as possible.
            </AlertDescription>
          </Alert>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="contact" className="flex items-center space-x-1 sm:space-x-2">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">Contact Us</span>
                  </TabsTrigger>
                  <TabsTrigger value="faq" className="flex items-center space-x-1 sm:space-x-2">
                    <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">FAQ</span>
                  </TabsTrigger>
                  {/* <TabsTrigger value="resources" className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Resources</span>
                  </TabsTrigger> */}
                </TabsList>

                {/* Contact Form */}
                <TabsContent value="contact">
                  <Card className={cn(
                    "shadow-lg",
                    isDark ? "border-zinc-800" : "border-gray-200"
                  )}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Send className="w-5 h-5 text-emerald-600" />
                        <span>Send us a Message</span>
                      </CardTitle>
                      <CardDescription>
                        Tell us about your question or issue. The more specific your description, 
                        the faster we can help you.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                              id="name"
                              placeholder="John Doe"
                              value={formData.name}
                              onChange={(e) => updateFormData('name', e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="john@company.com"
                              value={formData.email}
                              onChange={(e) => updateFormData('email', e.target.value)}
                              required
                            />
                          </div>
                        </div>



                        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select onValueChange={(value) => updateFormData('category', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="billing">Billing & Payments</SelectItem>
                                <SelectItem value="technical">Technical Issue</SelectItem>
                                <SelectItem value="feature">Feature Request</SelectItem>
                                <SelectItem value="account">Account Management</SelectItem>
                                <SelectItem value="integration">Integrations</SelectItem>
                                <SelectItem value="training">Training & Onboarding</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="priority">Priority Level</Label>
                            <Select 
                              value={formData.priority}
                              onValueChange={(value) => updateFormData('priority', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low - General question</SelectItem>
                                <SelectItem value="medium">Medium - Non-blocking issue</SelectItem>
                                <SelectItem value="high">High - Blocking workflow</SelectItem>
                                <SelectItem value="urgent">Urgent - Service down</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div> */}

                        <div className="space-y-2">
                          <Label htmlFor="description">Message *</Label>
                          <Textarea
                            id="description"
                            placeholder="Describe your question or issue in detail. Include steps to reproduce if it's a technical issue."
                            value={formData.description}
                            onChange={(e) => updateFormData('description', e.target.value)}
                            className="min-h-[120px]"
                            required
                          />
                        </div>

                        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-blue-800 dark:text-blue-400">
                            <strong>Response Times:</strong> Urgent issues (within 2 hours) • High priority (within 6 hours) • 
                            Medium priority (within 12 hours) • Low priority (within 24 hours)
                          </AlertDescription>
                        </Alert>

                        <Button
                          type="submit"
                          disabled={isSubmitting || !formData.name || !formData.email || !formData.description}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Sending Message...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* FAQ */}
                <TabsContent value="faq">
                  <Card className={cn(
                    "shadow-lg",
                    isDark ? "border-zinc-800" : "border-gray-200"
                  )}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <HelpCircle className="w-5 h-5 text-emerald-600" />
                        <span>Frequently Asked Questions</span>
                      </CardTitle>
                      <CardDescription>
                        Find quick answers to common questions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-6">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            placeholder="Search FAQ..."
                            className="pl-10"
                          />
                        </div>
                      </div>
                      
                      <Accordion type="single" collapsible className="space-y-2">
                        {faqData.map((faq, index) => (
                          <AccordionItem 
                            key={index} 
                            value={`item-${index}`}
                            className="border rounded-lg px-4"
                          >
                            <AccordionTrigger className="text-left">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 dark:text-gray-400">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Resources */}
                {/* <TabsContent value="resources">
                  <div className="space-y-6">
                    <Card className={cn(
                      "shadow-lg",
                      isDark ? "border-zinc-800" : "border-gray-200"
                    )}>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <FileText className="w-5 h-5 text-emerald-600" />
                          <span>Help Resources</span>
                        </CardTitle>
                        <CardDescription>
                          Explore our documentation and guides
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <FileText className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-medium mb-1">User Guide</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  Complete guide to using PulseBoard
                                </p>
                                <Button variant="outline" size="sm">View Guide</Button>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                <Globe className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <h3 className="font-medium mb-1">API Documentation</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  Integrate PulseBoard with your tools
                                </p>
                                <Button variant="outline" size="sm">View Docs</Button>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-purple-600" />
                              </div>
                              <div>
                                <h3 className="font-medium mb-1">Webinar Training</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  Join our weekly training sessions
                                </p>
                                <Button variant="outline" size="sm">Schedule</Button>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                                <MessageCircle className="w-4 h-4 text-orange-600" />
                              </div>
                              <div>
                                <h3 className="font-medium mb-1">Community Forum</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  Connect with other PulseBoard users
                                </p>
                                <Button variant="outline" size="sm">Join Forum</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent> */}
              </Tabs>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Support Channels */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className={cn(
                "shadow-lg",
                isDark ? "border-zinc-800" : "border-gray-200"
              )}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Headphones className="w-5 h-5 text-emerald-600" />
                    <span>Contact Methods</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {supportChannels.map((channel, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-zinc-800")}>
                        <channel.icon className={cn("w-4 h-4", channel.color)} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{channel.title}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          {channel.description}
                        </p>
                        <p className="text-xs font-medium">{channel.details}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {channel.responseTime}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Status */}
            {/* <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className={cn(
                "shadow-lg",
                isDark ? "border-zinc-800" : "border-gray-200"
              )}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-emerald-600" />
                    <span>Service Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">API Services</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-600">Operational</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Web Application</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-600">Operational</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-600">Operational</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      View Status Page
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div> */}
          </div>
        </div>
              </div>
      </div>
      
      <PublicPageFooter />
    </div>
  );
};

export default SupportPage; 