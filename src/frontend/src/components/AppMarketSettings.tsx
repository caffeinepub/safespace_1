import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Loader2, DollarSign, Wallet } from 'lucide-react';
import {
  useGetAppMarketMetadata,
  useSetAppMarketMetadata,
  useGetPricingConfig,
  useSetPricingConfig,
  useGetMarketAnalytics,
} from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import type { AppMarketMetadata, PricingConfig } from '../backend';

interface AppMarketSettingsProps {
  onBack: () => void;
}

export default function AppMarketSettings({ onBack }: AppMarketSettingsProps) {
  const { data: metadata, isLoading: metadataLoading } = useGetAppMarketMetadata();
  const { data: pricing, isLoading: pricingLoading } = useGetPricingConfig();
  const { data: analytics, isLoading: analyticsLoading } = useGetMarketAnalytics();
  const setMetadata = useSetAppMarketMetadata();
  const setPricing = useSetPricingConfig();

  const [title, setTitle] = useState(metadata?.title || 'SafeSpace');
  const [description, setDescription] = useState(
    metadata?.description || 'Your anonymous emotional support community'
  );
  const [category, setCategory] = useState(metadata?.category || 'Health & Wellness');
  const [tags, setTags] = useState(metadata?.tags.join(', ') || 'mental health, wellness, support');
  const [priceUSDC, setPriceUSDC] = useState(pricing?.priceUSDC ? Number(pricing.priceUSDC) / 100 : 0);
  const [oisyWallet, setOisyWallet] = useState(pricing?.oisyWalletAddress || '');

  const handleSaveMetadata = async () => {
    try {
      const newMetadata: AppMarketMetadata = {
        title,
        description,
        category,
        tags: tags.split(',').map((t) => t.trim()),
        screenshotUrls: metadata?.screenshotUrls || [],
        language: 'en',
      };
      await setMetadata.mutateAsync(newMetadata);
    } catch (error) {
      console.error('Failed to save metadata:', error);
    }
  };

  const handleSavePricing = async () => {
    try {
      const newPricing: PricingConfig = {
        priceUSDC: BigInt(Math.round(priceUSDC * 100)),
        currency: 'USDC',
        oisyWalletAddress: oisyWallet || undefined,
      };
      await setPricing.mutateAsync(newPricing);
    } catch (error) {
      console.error('Failed to save pricing:', error);
    }
  };

  const isLoading = metadataLoading || pricingLoading || analyticsLoading;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="ghost" size="icon" className="shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            App Market Settings
          </h1>
          <p className="text-muted-foreground mt-1">Configure your app listing and pricing</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <Card className="border-2 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle>App Metadata</CardTitle>
              <CardDescription>Information displayed in the app marketplace</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">App Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="SafeSpace"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Your anonymous emotional support community"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Health & Wellness"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="mental health, wellness, support"
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
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Metadata
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing Configuration
              </CardTitle>
              <CardDescription>Set your app pricing and payment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (USDC)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={priceUSDC}
                  onChange={(e) => setPriceUSDC(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wallet" className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Oisy Wallet Address
                </Label>
                <Input
                  id="wallet"
                  value={oisyWallet}
                  onChange={(e) => setOisyWallet(e.target.value)}
                  placeholder="Enter your Oisy wallet address"
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
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Pricing
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {analytics && (
            <Card className="border-2 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle>Market Analytics</CardTitle>
                <CardDescription>Performance metrics for your app</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                    <div className="text-2xl font-bold text-purple-600">{Number(analytics.totalViews)}</div>
                    <div className="text-sm text-muted-foreground">Views</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                    <div className="text-2xl font-bold text-purple-600">{Number(analytics.totalClones)}</div>
                    <div className="text-sm text-muted-foreground">Clones</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                    <div className="text-2xl font-bold text-purple-600">
                      {Number(analytics.totalSubscriptions)}
                    </div>
                    <div className="text-sm text-muted-foreground">Subscriptions</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                    <div className="text-2xl font-bold text-purple-600">
                      ${(Number(analytics.totalRevenue) / 100).toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">Revenue</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
