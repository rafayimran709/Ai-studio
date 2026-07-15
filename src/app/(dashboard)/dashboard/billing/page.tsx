'use client';

import * as React from 'react';
import { useStoryStore } from '@/hooks/useStoryStore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { CreditCard, Check, Flame } from 'lucide-react';
import { toast } from 'sonner';

export default function Billing() {
  const { creditsRemaining, subscriptionPlan, subscriptionStatus } =
    useStoryStore();
  const [loadingPlan, setLoadingPlan] = React.useState<string | null>(null);

  const handleUpgrade = (plan: string) => {
    setLoadingPlan(plan);
    toast.info(`Initializing Stripe session for "${plan}"...`);
    setTimeout(() => {
      setLoadingPlan(null);
      toast.success(
        `Stripe Portal Simulation: Subscription upgraded to ${plan}!`
      );
    }, 1000);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-8">
      {/* Title */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="mb-2 flex items-center gap-2 text-3xl font-extrabold tracking-tight text-white">
          <CreditCard className="text-glow-cyan h-8 w-8 text-cyan-400" />
          Credits & Subscriptions
        </h1>
        <p className="text-neutral-400">
          Manage your credit balances, billing intervals, and subscription tier
          licenses.
        </p>
      </div>

      {/* Credit balance card */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="relative overflow-hidden border-white/5 bg-[#0e0e12]/60 md:col-span-1">
          <div className="absolute top-0 left-0 h-[2px] w-full bg-cyan-500" />
          <CardHeader>
            <CardTitle className="text-base font-medium text-neutral-400">
              Credits Available
            </CardTitle>
            <CardDescription className="pt-1 text-3xl font-extrabold text-white">
              {creditsRemaining} Credits
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-neutral-500">
            1 credit is deducted per generation (produces 2 script variants).
          </CardContent>
          <CardFooter className="border-t border-white/5 bg-black/10 pt-4">
            <Button
              onClick={() => {
                toast.success('Simulation: Added 50 credits to your balance!');
                useStoryStore.setState((state) => ({
                  creditsRemaining: state.creditsRemaining + 50,
                }));
              }}
              className="w-full bg-cyan-500 text-xs font-bold text-black hover:bg-cyan-400"
            >
              Buy 50 Credits ($5)
            </Button>
          </CardFooter>
        </Card>

        <Card className="relative flex flex-col justify-between overflow-hidden border-white/5 bg-[#0e0e12]/60 md:col-span-2">
          <div className="absolute top-0 left-0 h-[2px] w-full bg-violet-500" />
          <CardHeader>
            <CardTitle className="text-base font-medium text-neutral-400">
              Current License Plan
            </CardTitle>
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xl font-bold text-white capitalize">
                {subscriptionPlan.replace('_', ' ')} Plan
              </span>
              <span className="rounded border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold text-violet-400 uppercase">
                {subscriptionStatus}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-xs leading-relaxed text-neutral-400">
            <p>
              Your subscription renews automatically. Inactive status suspends
              generation queue.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="rounded-lg border border-white/5 bg-[#07070a] p-3">
                <span className="block text-neutral-500">
                  Stripe Customer ID
                </span>
                <span className="font-mono text-neutral-300">
                  cus_test_studios8s2
                </span>
              </div>
              <div className="rounded-lg border border-white/5 bg-[#07070a] p-3">
                <span className="block text-neutral-500">Next Refill Date</span>
                <span className="text-neutral-300">August 15, 2026</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t border-white/5 bg-black/10 pt-4">
            <Button
              variant="outline"
              className="border-white/10 text-xs text-neutral-300 hover:bg-white/5"
            >
              Manage in Stripe Portal
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Plans Tier Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Select License Tier</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Plan 1 */}
          <Card className="flex flex-col justify-between border-white/5 bg-[#0e0e12]/60">
            <CardHeader>
              <CardTitle className="text-base text-white">
                Free Sandbox
              </CardTitle>
              <CardDescription className="text-xs text-neutral-400">
                For narrative hobbyists
              </CardDescription>
              <div className="pt-2 text-2xl font-extrabold text-white">$0</div>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-cyan-400" />
                <span>50 free registration credits</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-cyan-400" />
                <span>Llama 3.1 70B scriptwriting model</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-cyan-400" />
                <span>Default cinematic style settings</span>
              </div>
            </CardContent>
            <CardFooter className="border-t border-white/5 pt-4">
              <Button
                disabled
                className="w-full cursor-not-allowed border-white/5 bg-neutral-900 text-neutral-500"
              >
                Current Plan
              </Button>
            </CardFooter>
          </Card>

          {/* Plan 2 */}
          <Card className="relative flex flex-col justify-between overflow-hidden border-violet-500/20 bg-[#0e0e12]/60">
            <div className="absolute top-0 right-0 flex items-center gap-1 rounded-bl border-b border-l border-violet-500/20 bg-violet-600/10 p-2 text-[9px] font-bold text-violet-400">
              <Flame className="h-2.5 w-2.5" />
              <span>MOST POPULAR</span>
            </div>
            <CardHeader>
              <CardTitle className="text-base text-white">
                Creator Monthly
              </CardTitle>
              <CardDescription className="text-xs text-neutral-400">
                For indie producers & writers
              </CardDescription>
              <div className="pt-2 text-2xl font-extrabold text-white">
                $29
                <span className="text-xs font-normal text-neutral-500">
                  /mo
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-violet-400" />
                <span>500 monthly generation credits</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-violet-400" />
                <span>Storyline Continuity & Multi-part scripts</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-violet-400" />
                <span>Character Manager & Story Bible rules</span>
              </div>
            </CardContent>
            <CardFooter className="border-t border-white/5 pt-4">
              <Button
                onClick={() => handleUpgrade('creator_monthly')}
                disabled={loadingPlan === 'creator_monthly'}
                className="w-full bg-gradient-to-r from-cyan-500 to-violet-600 font-bold text-white hover:from-cyan-400 hover:to-violet-500"
              >
                Upgrade to Creator
              </Button>
            </CardFooter>
          </Card>

          {/* Plan 3 */}
          <Card className="flex flex-col justify-between border-white/5 bg-[#0e0e12]/60">
            <CardHeader>
              <CardTitle className="text-base text-white">
                Studio Yearly
              </CardTitle>
              <CardDescription className="text-xs text-neutral-400">
                For agencies & production teams
              </CardDescription>
              <div className="pt-2 text-2xl font-extrabold text-white">
                $240
                <span className="text-xs font-normal text-neutral-500">
                  /yr
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-cyan-400" />
                <span>Unlimited generation credits</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-cyan-400" />
                <span>Prioritized NVIDIA queue processing</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-cyan-400" />
                <span>Export scripts formatted for final cut / PDF</span>
              </div>
            </CardContent>
            <CardFooter className="border-t border-white/5 pt-4">
              <Button
                onClick={() => handleUpgrade('studio_yearly')}
                disabled={loadingPlan === 'studio_yearly'}
                className="w-full bg-cyan-500 font-bold text-black hover:bg-cyan-400"
              >
                Upgrade to Studio
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
