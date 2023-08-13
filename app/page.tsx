import PublicLayout from '@/app/(public)/layout';
import Pricing from '@/components/Pricing';
import {
  getSession,
  getSubscription,
  getActiveProductsWithPrices
} from '@/app/supabase-server';

export default async function PricingPage() {
  const [session, products, subscription] = await Promise.all([
    getSession(),
    getActiveProductsWithPrices(),
    getSubscription()
  ]);

  return (
    <PublicLayout>
        <Pricing
          session={session}
          user={session?.user}
          products={products}
          subscription={subscription}
        />
    </PublicLayout>
  );
}
