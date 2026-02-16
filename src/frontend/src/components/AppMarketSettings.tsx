import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import AccessDeniedScreen from './AccessDeniedScreen';
import { useGetAppMarketMetadata, useSetAppMarketMetadata, useGetPricingConfig, useSetPricingConfig, useGetMarketAnalytics } from '../hooks/useQueries';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface AppMarketSettingsProps {
  onBack: () => void;
  isAdmin: boolean;
}

export default function AppMarketSettings({ onBack, isAdmin }: AppMarketSettingsProps) {
  const { data: metadata, isLoading: metadataLoading } = useGetAppMarketMetadata();
  const { data: pricing, isLoading: pricingLoading } = useGetPricingConfig();
  const { data: analytics, isLoading: analyticsLoading } = useGetMarketAnalytics();
  const setMetadata = useSetAppMarketMetadata();
  const setPricing = useSetPricingConfig();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priceUSDC, setPriceUSDC] = useState('');

  useEffect(() => {
    if (metadata) {
      setTitle(metadata.title);
      setDescription(metadata.description);
      setCategory(metadata.category);
    }
  }, [metadata]);

  useEffect(() => {
    if (pricing) {
      setPriceUSDC(pricing.priceUSDC.toString());
    }
  }, [pricing]);

  if (!isAdmin) {
    return <AccessDeniedScreen onBack={onBack} />;
  }

  const handleSaveMetadata = async () => {
    try {
      await setMetadata.mutateAsync({
        title,
        description,
        category,
        tags: [],
        logoUrl: undefined,
        screenshotUrls: [],
        language: 'en',
      });
      toast.success('Metadata saved successfully');
    } catch (error) {
      console.error('Failed to save metadata:', error);
      toast.error('Failed to save metadata');
    }
  };

  const handleSavePricing = async () => {
    try {
      await setPricing.mutateAsync({
        priceUSDC: BigInt(priceUSDC || '0'),
        currency: 'USDC',
        oisyWalletAddress: undefined,
      });
      toast.success('Pricing saved successfully');
    } catch (error) {
      console.error('Failed to save pricing:', error);
      toast.error('Failed to save pricing');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>App Market Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            {metadataLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-lavender-600" />
              </div>
            )}

            {!metadataLoading && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
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
                    placeholder="A safe space for emotional support..."
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

                <Button onClick={handleSaveMetadata} disabled={setMetadata.isPending}>
                  {setMetadata.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Metadata
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            {pricingLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-lavender-600" />
              </div>
            )}

            {!pricingLoading && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USDC)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={priceUSDC}
                    onChange={(e) => setPriceUSDC(e.target.value)}
                    placeholder="0"
                  />
                </div>

                <Button onClick={handleSavePricing} disabled={setPricing.isPending}>
                  {setPricing.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Pricing
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-lavender-600" />
              </div>
            )}

            {!analyticsLoading && analytics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold">{analytics.totalViews.toString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Clones</p>
                  <p className="text-2xl font-bold">{analytics.totalClones.toString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subscriptions</p>
                  <p className="text-2xl font-bold">{analytics.totalSubscriptions.toString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">${analytics.totalRevenue.toString()}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
