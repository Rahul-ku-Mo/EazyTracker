import React from 'react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Sparkles, ArrowRight, X } from 'lucide-react';

interface TrialExpiredModalProps {
  open: boolean;
  onClose: () => void;
}

export const TrialExpiredModal: React.FC<TrialExpiredModalProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-white" />
          </div>
          
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Hey! Did you like our application?
          </DialogTitle>
          
          <DialogDescription className="text-gray-600 dark:text-gray-400 text-lg">
            Your 14-day free trial has ended. Subscribe to continue using PulseBoard and unlock all the features you love!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {/* Value proposition */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="font-medium text-gray-900 dark:text-white">What you'll keep:</span>
            </div>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• All your projects and data</li>
              <li>• Team collaboration features</li>
              <li>• Advanced analytics & insights</li>
              <li>• Priority support</li>
            </ul>
          </div>

          {/* Popular plan highlight */}
          <div className="bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  Most Popular
                </Badge>
                <span className="font-semibold text-gray-900 dark:text-white">Professional</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">$9.99</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">/month</div>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Perfect for growing teams and businesses
            </p>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              15 projects • 100 team members • Unlimited tasks
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pt-2">
            <Link to="/billing" onClick={onClose}>
              <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                Subscribe to Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full" 
              onClick={onClose}
            >
              Maybe Later
            </Button>
          </div>

          {/* Reassurance */}
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
            We'll make sure everything you want will be implemented earlier. 
            <br />
            No commitment required • Cancel anytime
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 