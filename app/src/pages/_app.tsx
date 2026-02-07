import type { AppProps } from 'next/app';
import { PrivyProvider } from '../components/PrivyProvider';

require('../styles/globals.css');

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <PrivyProvider>
      <Component {...pageProps} />
    </PrivyProvider>
  );
}

export default MyApp;
