import { useEffect, useState } from 'react';
import { TelegramWebApps } from 'telegram-webapps-types';

/**
 * Hook to get the initial data from the Telegram Web Apps API already parsed.
 * @example
 * const { hash } = useTelegramInitData();
 * console.log({ hash });
 */
function useTelegramInitData() {
  const [data, setData] = useState<TelegramWebApps.WebAppInitData | null>(null);

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const firstLayerInitData = Object.fromEntries(
        new URLSearchParams(window.Telegram.WebApp.initData)
      );

      const initData: Record<string, any> = {};

      for (const key in firstLayerInitData) {
        try {
          initData[key] = JSON.parse(firstLayerInitData[key]);
        } catch {
          initData[key] = firstLayerInitData[key];
        }
      }

      setData(initData as TelegramWebApps.WebAppInitData);
    } else {
      console.error('Telegram WebApp is not initialized');
    }
  }, []);

  return data;
}

export default useTelegramInitData;
