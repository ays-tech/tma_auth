import '../styles/globals.css';
import axios from 'axios';
import type { AppProps } from 'next/app';
import { Roboto, Roboto_Mono } from 'next/font/google';
import { useEffect, useState } from 'react';

import useTelegramInitData from '../hooks/useTelegramInitData'; // Adjust the path as needed

const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  variable: '--font-roboto',
  subsets: ['latin'], // Specify the required subsets
});

const robotoMono = Roboto_Mono({
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  variable: '--font-roboto-mono',
  subsets: ['latin'], // Specify the required subsets
});

function MyApp({ Component, pageProps }: AppProps) {
  const [isHashValid, setIsHashValid] = useState(false);
  const [isInitDataProcessed, setIsInitDataProcessed] = useState(false);
  const initData = useTelegramInitData();

  useEffect(() => {
    if (initData) {
      console.log('Checking initData:', initData);
      if (initData.hash) {
        console.log('Received initData:', initData);
        axios
          .post('/api/validate-hash', initData) // Post all initData
          .then((response) => {
            console.log('Hash validation response:', response.data);
            setIsHashValid(response.status === 200);
            setIsInitDataProcessed(true);
          })
          .catch((error) => {
            console.error('Error validating hash:', error.response ? error.response.data : error.message);
            setIsHashValid(false);
            setIsInitDataProcessed(true);
          });
      } else {
        console.error('initData or hash is missing');
        setIsInitDataProcessed(true);
      }
    }
  }, [initData]);

  if (!isInitDataProcessed) {
    return <div>Loading...</div>;
  }

  if (!isHashValid) {
    return <div>Error: Invalid hash.</div>;
  }

  if (!initData || !initData.hash) {
    return <div>Error: Telegram initialization data is missing.</div>;
  }

  return (
    <div className={`${roboto.variable} ${robotoMono.variable}`}>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
