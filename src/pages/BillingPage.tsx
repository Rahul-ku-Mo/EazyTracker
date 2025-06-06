import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PricingPlans, BillingOverview } from '@/_components/Billing';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { CreditCard, Package } from 'lucide-react';
import MainLayout from '@/layouts/Container';

const BillingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    // Handle payment success/cancellation from URL params
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success === 'true') {
      toast.success('Payment successful! Your subscription has been activated.');
      // Remove the success param from URL
      searchParams.delete('success');
      setSearchParams(searchParams);
    }

    if (canceled === 'true') {
      toast.info('Payment was canceled. You can try again anytime.');
      // Remove the canceled param from URL
      searchParams.delete('canceled');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  return (
    <MainLayout title="Billing & Subscription">
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Billing & Subscription</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your subscription, view billing information, and upgrade your plan.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Plans & Pricing</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Management</CardTitle>
                <CardDescription>
                  View your current subscription status and manage billing preferences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BillingOverview />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Plan</CardTitle>
                <CardDescription>
                  Select the perfect plan for your team's needs. You can upgrade or downgrade at any time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PricingPlans />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default BillingPage; 