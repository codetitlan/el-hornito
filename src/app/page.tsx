import { redirect } from 'next/navigation';

// This page should never be rendered since the middleware
// will redirect all requests to the appropriate locale
// But as a fallback, we'll redirect to /en
export default function RootPage() {
  redirect('/en');
}
