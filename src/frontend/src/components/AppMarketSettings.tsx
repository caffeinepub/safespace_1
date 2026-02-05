import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Store, DollarSign, TrendingUp, Loader2 } from 'lucide-react';
import {
  useAppMarketMetadata,
  useSetAppMarketMetadata,
  usePricingConfig,
  useSetPricingConfig,
  useMarketAnalytics,
} from '../hooks/useQueries';
import type { AppMarketMetadata, PricingConfig } from '../backend';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface AppMarketSettingsProps {
  onBack: () => void;
}

export default function AppMarketSettings({ onBack }: AppMarketSettingsProps) {
  const { data: metadata, isLoading: metadataLoading } = useAppMarketMetadata();
  const { data: pricing, isLoading: pricingLoading } = usePricingConfig();
  const { data: analytics, isLoading: analyticsLoading } = useMarketAnalytics();

  const setMetadata = useSetAppMarketMetadata();
  const setPricing = useSetPricingConfig();

  const [title, setTitle] = useState(metadata?.title || 'SafeSpace: Anonymous Emotional Support & Mood Tracker');
  const [description, setDescription] = useState(
    metadata?.description ||
      'A serene, privacy-first space for sharing emotions, tracking moods, and connecting with supportive communities anonymously.'
  );
  const [priceUSDC, setPriceUSDC] = useState(pricing?.priceUSDC ? Number(pricing.priceUSDC) : 2);
  const [walletAddress, setWalletAddress] = useState(pricing?.oisyWalletAddress || '');

  const handleSaveMetadata = async () => {
    const newMetadata: AppMarketMetadata = {
      title,
      description,
      category: 'Wellness / Mental Health Support',
      tags: ['emotional wellbeing', 'mood tracking', 'anonymous chat', 'support', 'safe space'],
      screenshotUrls: ['/assets/generated/safespace-dashboard-screenshot.dim_800x600.png'],
      language: 'English',
    };

    try {
      await setMetadata.mutateAsync(newMetadata);
    } catch (error) {
      console.error('Failed to save metadata:', error);
    }
  };

  const handleSavePricing = async () => {
    const newPricing: PricingConfig = {
      priceUSDC: BigInt(priceUSDC),
      currency: 'USDC',
      oisyWalletAddress: walletAddress || undefined,
    };

    try {
      await setPricing.mutateAsync(newPricing);
      toast.success('Pricing and wallet updated successfully');
    } catch (error) {
      console.error('Failed to save pricing:', error);
    }
  };

  if (metadataLoading || pricingLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex items-center gap-4">
        <Button
          onClick={onBack}
          variant="ghost"
          size="icon"
          className="shrink-0 hover:bg-purple-100 dark:hover:bg-purple-900/30"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            App Market Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your app listing and monetization
          </p>
        </div>
      </div>

      {/* Market Analytics */}
      <Card className="border-2 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <CardTitle>Market Performance</CardTitle>
          </div>
          <CardDescription>Your app's performance on the Caffeine App Market</CardDescription>
        </CardHeader>
        <CardContent>
          {analyticsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : analytics ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
                <div className="text-2xl font-bold text-blue-600">{Number(analytics.totalViews)}</div>
                <div className="text-sm text-muted-foreground">Total Views</div>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                <div className="text-2xl font-bold text-purple-600">{Number(analytics.totalClones)}</div>
                <div className="text-sm text-muted-foreground">Clones</div>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30">
                <div className="text-2xl font-bold text-green-600">{Number(analytics.totalSubscriptions)}</div>
                <div className="text-sm text-muted-foreground">Subscriptions</div>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30">
                <div className="text-2xl font-bold text-orange-600">${Number(analytics.totalRevenue)}</div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No analytics data available</p>
          )}
        </CardContent>
      </Card>

      {/* App Metadata */}
      <Card className="border-2 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-purple-600" />
            <CardTitle>App Listing Information</CardTitle>
          </div>
          <CardDescription>Configure how your app appears on the marketplace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">App Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="SafeSpace: Anonymous Emotional Support & Mood Tracker"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A serene, privacy-first space..."
              className="min-h-[100px]"
            />
          </div>
          <Button
            onClick={handleSaveMetadata}
            disabled={setMetadata.isPending}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {setMetadata.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Metadata'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Pricing Configuration */}
      <Card className="border-2 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            <CardTitle>Pricing & Monetization</CardTitle>
          </div>
          <CardDescription>Set your app's pricing and payment details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price (USDC)</Label>
            <Input
              id="price"
              type="number"
              value={priceUSDC}
              onChange={(e) => setPriceUSDC(Number(e.target.value))}
              min="0"
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wallet">OISY Wallet Address</Label>
            <Input
              id="wallet"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Enter your OISY wallet address"
            />
          </div>
          <Button
            onClick={handleSavePricing}
            disabled={setPricing.isPending}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {setPricing.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Pricing & Wallet'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
