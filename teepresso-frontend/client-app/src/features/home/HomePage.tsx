import { useStorefront } from '@/common/context/StorefrontContext';
import { StandardHomePage } from '@/features/home/StandardHomePage';
import { FestiveHomePage } from '@/features/home/FestiveHomePage';

export function HomePage() {
  const { storefrontMode } = useStorefront();

  if (storefrontMode === 'FESTIVE') {
    return <FestiveHomePage />;
  }

  return <StandardHomePage />;
}

export default HomePage;
