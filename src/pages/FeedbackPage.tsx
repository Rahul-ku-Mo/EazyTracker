import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  Star, 
  Send, 
  Heart,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeProvider';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import PublicPageHeader from '@/components/shared/PublicPageHeader';
import PublicPageFooter from '@/components/shared/PublicPageFooter';

type FeedbackType = 'feature' | 'bug' | 'improvement' | 'testimonial';

interface FeedbackFormData {
  type: FeedbackType;
  description: string;
  email: string;
  allowContact: boolean;
  rating?: number;
}

const FeedbackPage: React.FC = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<FeedbackType>('feature');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FeedbackFormData>({
    type: 'feature',
    description: '',
    email: '',
    allowContact: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Thank you for your feedback! We\'ll review it and get back to you soon.');
      
      // Reset form
      setFormData({
        type: activeTab,
        description: '',
        email: '',
        allowContact: true,
      });
    } catch {
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof FeedbackFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTabChange = (value: string) => {
    const newTab = value as FeedbackType;
    setActiveTab(newTab);
    updateFormData('type', newTab);
  };

  const StarRating = ({ rating, setRating }: { rating: number, setRating: (rating: number) => void }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={cn(
              "transition-colors",
              star <= rating ? "text-yellow-400" : "text-gray-300"
            )}
          >
            <Star className="w-6 h-6 fill-current" />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className={cn("min-h-screen", isDark ? "bg-zinc-900" : "bg-white")}>
      <PublicPageHeader />
      
      <div className="pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6">
        <div className="container max-w-4xl mx-auto">
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
            We Value Your{' '}
            <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">
              Feedback
            </span>
          </h1>
          <p className={cn(
            "text-lg sm:text-xl max-w-2xl mx-auto",
            isDark ? "text-zinc-300" : "text-zinc-600"
          )}>
            Help us improve PulseBoard by sharing your ideas, reporting issues, 
            or telling us about your experience.
          </p>
        </motion.div>

        {/* Feedback Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className={cn(
            "shadow-lg",
            isDark ? "border-zinc-800" : "border-gray-200"
          )}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <span>Share Your Feedback</span>
              </CardTitle>
              <CardDescription>
                Your input helps us make PulseBoard better for everyone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                  <TabsTrigger value="feature" className="flex items-center space-x-1 sm:space-x-2">
                    <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm hidden xs:inline">Feature</span>
                    <span className="hidden sm:inline">Request</span>
                  </TabsTrigger>
                  <TabsTrigger value="bug" className="flex items-center space-x-1 sm:space-x-2">
                    <Bug className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">Bug</span>
                    <span className="hidden sm:inline">Report</span>
                  </TabsTrigger>
                  <TabsTrigger value="improvement" className="flex items-center space-x-1 sm:space-x-2">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm hidden xs:inline">Improve</span>
                    <span className="hidden sm:inline">ment</span>
                  </TabsTrigger>
                  <TabsTrigger value="testimonial" className="flex items-center space-x-1 sm:space-x-2">
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm hidden xs:inline">Review</span>
                    <span className="hidden sm:inline">Testimonial</span>
                  </TabsTrigger>
                </TabsList>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <TabsContent value="feature" className="space-y-4">
                    <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                      <AlertDescription className="text-blue-800 dark:text-blue-400 flex items-center">
                      <Lightbulb className="h-4 w-4 text-blue-600 mr-2" />
                        Have an idea for a new feature? We'd love to hear it! Describe what you'd like to see and how it would help you.
                      </AlertDescription>
                    </Alert>


                  </TabsContent>

                  <TabsContent value="bug" className="space-y-4">
                    <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                      <AlertDescription className="text-red-800 dark:text-red-400 flex items-center">
                      <Bug className="h-4 w-4 text-red-600 mr-2" />
                        Found a bug? Help us fix it! Provide as much detail as possible about what happened and how to reproduce it.
                      </AlertDescription>
                    </Alert>


                  </TabsContent>

                  <TabsContent value="improvement" className="space-y-4">
                    <Alert className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20">
                      <AlertDescription className="text-purple-800 dark:text-purple-400 flex items-center">
                      <Sparkles className="h-4 w-4 text-purple-600 mr-2" />
                        See something that could be better? Share your suggestions for improving existing features.
                      </AlertDescription>
                    </Alert>


                  </TabsContent>

                  <TabsContent value="testimonial" className="space-y-4">
                    <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                      <AlertDescription className="text-green-800 dark:text-green-400 flex items-center">
                      <Heart className="h-4 w-4 text-green-600 mr-2" />
                        Love using PulseBoard? Share your experience and help others discover what makes our platform special.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Label>Overall Rating</Label>
                      <StarRating 
                        rating={formData.rating || 5} 
                        setRating={(rating) => updateFormData('rating', rating)} 
                      />
                    </div>
                  </TabsContent>

                  {/* Common Fields */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder={
                          activeTab === 'feature' ? 'Describe the feature you\'d like to see...' :
                          activeTab === 'bug' ? 'Describe the bug and steps to reproduce it...' :
                          activeTab === 'improvement' ? 'Describe how this could be improved...' :
                          'Share your experience with PulseBoard...'
                        }
                        value={formData.description}
                        onChange={(e) => updateFormData('description', e.target.value)}
                        className="min-h-[120px]"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm sm:text-base">Email (Optional)</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        className="text-sm sm:text-base"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allow-contact"
                        checked={formData.allowContact}
                        onCheckedChange={(checked) => updateFormData('allowContact', checked)}
                      />
                      <Label htmlFor="allow-contact" className="text-sm">
                        Allow us to contact you about this feedback
                      </Label>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.description}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-10 sm:h-12 text-sm sm:text-base"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        Submit Feedback
                      </>
                    )}
                  </Button>
                </form>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Thank you message for early users */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className={cn(
            "shadow-lg border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20",
            isDark ? "border-zinc-800" : "border-gray-200"
          )}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400">
                <Heart className="w-5 h-5" />
                <span>Thank You for Being an Early User!</span>
              </CardTitle>
              <CardDescription className="text-emerald-600 dark:text-emerald-300">
                Your feedback helps shape the future of PulseBoard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-emerald-700 dark:text-emerald-300">
                As one of our early users, your feedback is incredibly valuable to us. 
                Every feature request, bug report, and suggestion helps us build a better 
                product for you and future users. Thank you for being part of our journey!
              </p>
            </CardContent>
          </Card>
        </motion.div>
        </div>
      </div>
      
      <PublicPageFooter />
    </div>
  );
};

export default FeedbackPage; 