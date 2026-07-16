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
import { CreditCard, Check } from 'lucide-react';
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
      // Simulate upgrading plan in the store
      useStoryStore.setState({
        subscriptionPlan: plan as 'free' | 'creator_monthly' | 'studio_yearly',
      });
      toast.success(`Subscription upgraded to ${plan.replace('_', ' ')}!`);
    }, 800);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8">
      {/* Title */}
      <div className="flex flex-col gap-2 border-b border-zinc-900 pb-6">
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-white">
          <CreditCard className="h-7 w-7 text-zinc-400" />
          Credits & Subscriptions
        </h1>
        <p className="text-sm text-zinc-400">
          Manage your credit balances, billing intervals, and subscription tier
          licenses.
        </p>
      </div>

      {/* Credit balance card */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="border-zinc-800 bg-zinc-900/20 md:col-span-1">
          <CardHeader>
            <CardTitle className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
              Credits Available
            </CardTitle>
            <CardDescription className="pt-2 font-sans text-3xl font-extrabold text-white">
              {creditsRemaining} Credits
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs leading-relaxed text-zinc-500">
            1 credit is deducted per generation (produces 2 script variants).
          </CardContent>
          <CardFooter className="border-t border-zinc-900 bg-zinc-900/10 pt-4">
            <Button
              onClick={() => {
                toast.success('Simulation: Added 50 credits to your balance!');
                useStoryStore.setState((state) => ({
                  creditsRemaining: state.creditsRemaining + 50,
                }));
              }}
              className="w-full bg-white py-2 text-xs font-semibold text-black hover:bg-zinc-200"
            >
              Buy 50 Credits ($5)
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col justify-between border-zinc-800 bg-zinc-900/20 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
              Current License Plan
            </CardTitle>
            <div className="flex items-center gap-2 pt-2">
              <span className="text-lg font-bold text-white capitalize">
                {subscriptionPlan.replace('_', ' ')} Plan
              </span>
              <span className="border-zinc-850 rounded border bg-zinc-900 px-2 py-0.5 text-[10px] font-bold tracking-wide text-zinc-400 uppercase">
                {subscriptionStatus}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-zinc-400">
            <p className="leading-relaxed">
              Your subscription renews automatically. Inactive status suspends
              generation queue.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded border border-zinc-900 bg-zinc-950/40 p-3">
                <span className="block text-[10px] font-semibold tracking-wide text-zinc-600 uppercase">
                  Stripe Customer ID
                </span>
                <span className="mt-1 block font-mono text-xs text-zinc-300">
                  cus_test_studios8s2
                </span>
              </div>
              <div className="rounded border border-zinc-900 bg-zinc-950/40 p-3">
                <span className="block text-[10px] font-semibold tracking-wide text-zinc-600 uppercase">
                  Next Refill Date
                </span>
                <span className="mt-1 block text-xs text-zinc-300">
                  August 15, 2026
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t border-zinc-900 bg-zinc-900/10 pt-4">
            <Button
              variant="outline"
              className="border-zinc-800 text-xs text-zinc-400 hover:text-white"
            >
              Manage in Stripe Portal
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Plans Tier Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-zinc-300">
          Select License Tier
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Plan 1 */}
          <Card className="flex flex-col justify-between border-zinc-800 bg-zinc-900/20">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-white">
                Free Sandbox
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                For narrative hobbyists
              </CardDescription>
              <div className="pt-2 text-2xl font-bold text-white">$0</div>
            </CardHeader>
            <CardContent className="space-y-2.5 border-t border-zinc-900 pt-4 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-zinc-500" />
                <span>50 free registration credits</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-zinc-500" />
                <span>Llama 3.1 70B model access</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-zinc-500" />
                <span>Default cinematic style settings</span>
              </div>
            </CardContent>
            <CardFooter className="mt-4 border-t border-zinc-900/60 pt-4">
              <Button
                disabled
                className="w-full cursor-not-allowed border-zinc-800 bg-zinc-900 text-xs font-semibold text-zinc-600"
              >
                Sandbox Selected
              </Button>
            </CardFooter>
          </Card>

          {/* Plan 2 */}
          <Card className="relative flex flex-col justify-between border-zinc-800 bg-zinc-900/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-white">
                  Creator Monthly
                </CardTitle>
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-[8px] font-bold tracking-wide text-zinc-400 uppercase">
                  Popular
                </span>
              </div>
              <CardDescription className="text-xs text-zinc-500">
                For indie producers & writers
              </CardDescription>
              <div className="pt-2 text-2xl font-bold text-white">
                $29
                <span className="text-xs font-normal text-zinc-500">/mo</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5 border-t border-zinc-900 pt-4 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-zinc-300" />
                <span>500 monthly generation credits</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-zinc-300" />
                <span>Storyline Continuity & Multi-part scripts</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-zinc-300" />
                <span>Character Manager & Story Bible rules</span>
              </div>
            </CardContent>
            <CardFooter className="mt-4 border-t border-zinc-900/60 pt-4">
              <Button
                onClick={() => handleUpgrade('creator_monthly')}
                disabled={
                  loadingPlan === 'creator_monthly' ||
                  subscriptionPlan === 'creator_monthly'
                }
                className="w-full bg-white text-xs font-semibold text-black hover:bg-zinc-200"
              >
                {subscriptionPlan === 'creator_monthly'
                  ? 'Current Plan'
                  : 'Upgrade to Creator'}
              </Button>
            </CardFooter>
          </Card>

          {/* Plan 3 */}
          <Card className="flex flex-col justify-between border-zinc-800 bg-zinc-900/20">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-white">
                Studio Yearly
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                For agencies & production teams
              </CardDescription>
              <div className="pt-2 text-2xl font-bold text-white">
                $240
                <span className="text-xs font-normal text-zinc-500">/yr</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5 border-t border-zinc-900 pt-4 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-zinc-500" />
                <span>Unlimited generation credits</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-zinc-500" />
                <span>Prioritized NVIDIA queue processing</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-zinc-500" />
                <span>Export scripts formatted for PDF/Final Cut</span>
              </div>
            </CardContent>
            <CardFooter className="mt-4 border-t border-zinc-900/60 pt-4">
              <Button
                onClick={() => handleUpgrade('studio_yearly')}
                disabled={
                  loadingPlan === 'studio_yearly' ||
                  subscriptionPlan === 'studio_yearly'
                }
                className="w-full border border-zinc-800 bg-zinc-900 text-xs font-semibold text-white hover:bg-zinc-800"
              >
                {subscriptionPlan === 'studio_yearly'
                  ? 'Current Plan'
                  : 'Upgrade to Studio'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
