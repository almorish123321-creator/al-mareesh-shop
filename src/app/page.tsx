import HomeClient from './home-client';

// Force dynamic rendering to avoid hydration issues
export const dynamic = 'force-dynamic';

export default function Page() {
  return <HomeClient />;
}
