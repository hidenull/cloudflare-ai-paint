"use client";
import { useEffect, useState } from 'react';
import { theme, Spin } from 'antd';
import ConfigProvider from 'antd/lib/config-provider';
import App from 'antd/lib/app';
import FloatButton from 'antd/lib/float-button';

export const runtime = 'edge';

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [Indication, setIndication] = useState<any>();

  useEffect(() => {
    setIsDarkMode(localStorage.getItem('isDarkMode') === 'true');

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
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {},
      }}
    >
      <App style={{ width: '100vw', height: '100vh' }}>
        {isLoading ? <></> : <FloatButton
          onClick={() => {
            setIsDarkMode(!isDarkMode);
            localStorage.setItem('isDarkMode', isDarkMode ? 'false' : 'true');
          }}
          description={isDarkMode ? '暗' : '明'}
          tooltip={isDarkMode ? '切换到明亮模式' : '切换到黑夜模式'}
          shape={'square'}
        />
        }
        {isLoading ? <Spin fullscreen /> : (Indication && <Indication isDarkMode={isDarkMode} />)}
      </App>
    </ConfigProvider>
  )
}
