"use client";
import { useEffect, useState } from 'react';
import { theme, Spin } from 'antd';
import ConfigProvider from 'antd/lib/config-provider';
import App from 'antd/lib/app';

export const runtime = 'edge';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [Indication, setIndication] = useState<any>();

  useEffect(() => {
    import('./components/Indication').then(module => {
      setIndication(() => module.default);
      setIsLoading(false);
    }).catch(error => {
      console.error('Failed to import Indication component:', error);
      setIsLoading(false);
    });
  }, []);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {},
      }}
    >
      <App style={{ width: '100vw', height: '100vh' }}>
        {isLoading ? <Spin fullscreen /> : (Indication && <Indication />)}
      </App>
    </ConfigProvider>
  )
}
