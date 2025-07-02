import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    <MainLayout title="Billing & Subscription" fwdClassName="flex flex-col h-full p-0">
      <div className="">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Billing & Subscription</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Upgrade to enable unlimited tracking, enhanced security controls, and additional features.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>Billing</span>
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Plans</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <BillingOverview />
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            <PricingPlans />
          </TabsContent>
        </Tabs>
    </MainLayout>
  );
};

export default BillingPage; 