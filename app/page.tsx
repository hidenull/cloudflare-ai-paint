"use client";
import { useEffect, useState } from 'react';
import { theme, Spin } from 'antd';
import Indication from './components/Indication';
import ConfigProvider from 'antd/lib/config-provider';
import App from 'antd/lib/app';
import FloatButton from 'antd/lib/float-button';
export const runtime = 'edge';
export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    setIsDarkMode(localStorage.getItem('isDarkMode') === 'true');
  }, []);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {},
      }}
    >
      <App style={{ width: '100vw', height: '100vh' }}>
        <FloatButton
          onClick={() => {
            setIsDarkMode(!isDarkMode);
            localStorage.setItem('isDarkMode', isDarkMode ? 'false' : 'true');
          }}
          description={isDarkMode ? '暗' : '明'}
          tooltip={isDarkMode ? '切换到明亮模式' : '切换到黑夜模式'}
          shape={'square'}
        />
        <Indication isDarkMode={isDarkMode} />
      </App>
    </ConfigProvider>
  )
}
