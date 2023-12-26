"use client";
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {message,theme,TimelineProps,Button,Spin} from 'antd';

const DynamicConfigProvider = dynamic(() => import('antd').then(mod => mod.ConfigProvider), {loading: () => <Spin />,ssr:false});
const DynamicApp = dynamic(async() => (await import('antd').then(mod => mod.App)), {loading: () => <Spin />,ssr:false});
const DynamicFlex = dynamic(async() => (await import('antd').then(mod => mod.Flex)), {loading: () => <Spin />,ssr:false});
const DynamicCard = dynamic(async() => (await import('antd').then(mod => mod.Card)), {loading: () => <Spin />,ssr:false});
const DynamicSearch = dynamic(async () => (await import("antd").then(mod => mod.Input)).Search, {loading: () => <Spin />,ssr:false});
const DynamicImage = dynamic(() => import('antd').then(mod => mod.Image), { loading: () => <p>Loading...</p>, ssr: false });
const DynamicDeleteOutlined = dynamic(() => import('@ant-design/icons').then(icons => icons.DeleteOutlined), {ssr: false,});
const DynamicTimeline = dynamic(() => import('antd').then(mod => mod.Timeline), { ssr: false });
const DynamicTooltip = dynamic(() => import('antd').then(mod => mod.Tooltip), { ssr: false });
const DynamicFloatButton = dynamic(() => import('antd').then(mod => mod.FloatButton), { ssr: false });

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [translationLoading, setTranslationLoading] = useState(false);
  const [generationLoading, setGenerationLoading] = useState(false);
  const [deletingImageURL, setDeletingImageURL] = useState('');
  const [inputText, setInputText] = useState('');
  const [items, setItems] = useState<TimelineProps['items']>([]);

  const handleTranslateText = async () => {
    if (inputText.length == 0) {
      message.error("请输入提示词");
      return;
    }
    setTranslationLoading(true);
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text_list: [inputText], target_lang: 'english' })
    }).then(async res => {
      if (res.ok) {
        const res_json = await res.json()
        setInputText(res_json.translations[0].text)
      } else {
        message.error("翻译失败: " + res.statusText);
        throw new Error("翻译失败: " + res.statusText);
      }
    }).catch(err => {
      message.error("翻译请求错误: " + err);
    }).finally(() => {
      setTranslationLoading(false);
    });
  }

  const handleDeleteImage = async (image_url: string) => {
    setDeletingImageURL(image_url);
    await fetch(image_url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    }).then(async res => {
      if (res.ok) {
        setItems(prevItems => (prevItems || []).filter(item => item.key !== image_url));
        const storedItems = localStorage.getItem('imageItems');
        if (storedItems) {
          const imageItems = JSON.parse(storedItems);
          const updatedItems = imageItems.filter((item: any) => item.image_url !== image_url);
          localStorage.setItem('imageItems', JSON.stringify(updatedItems));
        }
        message.success("删除成功,KV边缘节点或浏览器可能存在缓存,短时间后会自动删除");
      } else {
        message.error("删除失败: " + res.statusText);
        console.log("删除失败: ", res);
        throw new Error("删除失败: " + res.statusText);
      }
    }).catch(err => {
      message.error("删除失败: " + err);
      console.log("删除失败: ", err);
    }).finally(() => {
      setDeletingImageURL('');
    });
  };


  const handleGenerateImage = async () => {
    if (inputText.length == 0) {
      message.error("请输入提示词");
      return;
    }
    setGenerationLoading(true);
    await fetch('/api/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: inputText })
    }).then(async res => {
      if (res.ok) {
        const { image_url } = await res.json();

        // Store the image_url in LocalStorage with expiration time of 7 days
        const expirationTime = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;

        // Retrieve the existing imageItems from LocalStorage or initialize an empty array
        const storedItems = localStorage.getItem('imageItems');
        const imageItems = storedItems ? JSON.parse(storedItems) : [];

        // Add the new imageItem to the array
        imageItems.push({ image_url, expirationTime, prompt: inputText });

        // Store the updated imageItems in LocalStorage
        localStorage.setItem('imageItems', JSON.stringify(imageItems));

        setItems(prevItems => [...(prevItems || []), {
          key: image_url,
          children: (
            <DynamicCard
              hoverable={true}
              size="small"
              title={<DynamicTooltip title={inputText}><span>{inputText.length > 15 ? `${inputText.slice(0, 15)}...` : inputText}</span></DynamicTooltip>}
              extra={deletingImageURL == image_url ? <Spin /> : <DynamicDeleteOutlined onClick={() => handleDeleteImage(image_url)} />}
            >
              <DynamicImage loading='lazy' src={image_url} alt={image_url} height={200} width={200} />
            </DynamicCard>
          ),
        }]);
        message.success("生成成功");
        setInputText('');
      } else {
        message.error("生成失败: " + res.statusText);
        console.log("生成失败: ", res.statusText);
      }
    }).catch(err => {
      message.error("生成请求错误: " + err);
      console.log("生成请求错误: ", err);
    }).finally(() => {
      setGenerationLoading(false);
    });
  }

  const translateSuffix = (
    <DynamicTooltip title={translationLoading ? '翻译中' : '翻译为英文,提高模型效率'}>
      {translationLoading || generationLoading ||deletingImageURL!=''? <Spin /> : <DynamicImage preview={false} onClick={handleTranslateText} src='/translate.svg' alt="Translate" width={20} height={20} style={{ userSelect: 'none' }} />}
    </DynamicTooltip>
  );

  useEffect(() => {
    setIsDarkMode(localStorage.getItem('isDarkMode') === 'true');

    // Check if there are stored imageItems in LocalStorage
    const storedItems = localStorage.getItem('imageItems');
    if (storedItems) {
      const imageItems = JSON.parse(storedItems);
      const currentTime = new Date().getTime();

      // Iterate through the imageItems and check if each image_url has expired
      for (const item of imageItems) {
        if (currentTime < item.expirationTime) {
          setItems(prevItems => [...(prevItems || []), {
            key: item.image_url, // Use the image_url as the key
            children: (
              <DynamicCard
                hoverable={true}
                size="small"
                title={<DynamicTooltip title={item.prompt}><span>{item.prompt.length > 15 ? `${item.prompt.slice(0, 15)}...` : item.prompt}</span></DynamicTooltip>}
                extra={deletingImageURL == item.image_url ? <Spin /> : <DynamicDeleteOutlined onClick={() => handleDeleteImage(item.image_url)} />}
              >
                <DynamicImage loading='lazy' src={item.image_url} alt={item.image_url} height={200} width={200} />
              </DynamicCard>
            ),
          }]);
        } else {
          // Remove the expired imageItem from the array
          const updatedItems = imageItems.filter((i: any) => i.image_url !== item.image_url);

          // Update the imageItems in LocalStorage
          localStorage.setItem('imageItems', JSON.stringify(updatedItems));
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DynamicConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {},
        components: {
          Button: {
            primaryColor: isDarkMode ? '#white' : 'black',
          },
        },
      }}
    >
      <DynamicApp style={{ width: '100vw', height: '100vh' }}>
        <DynamicFloatButton
          onClick={() => {
            setIsDarkMode(!isDarkMode);
            localStorage.setItem('isDarkMode', isDarkMode ? 'false' : 'true');
          }}
          description={isDarkMode ? '暗' : '明'}
          tooltip={isDarkMode ? '切换到明亮模式' : '切换到黑夜模式'}
          shape={'square'}
        />
        <DynamicFlex
          style={{
            backgroundColor: isDarkMode ? 'black' : 'white',
            height: '100%',
            width: '100%',
            overflowY: 'auto',
            alignItems: 'center',
            justifyContent: items && items.length === 0 ? 'center' : undefined,
          }}
          vertical
        >
          <DynamicSearch
            placeholder="请输入指示词"
            enterButton={
              <Button
                type="primary"
                loading={generationLoading || translationLoading || deletingImageURL !== ''}
                onClick={handleGenerateImage}
              >
                生成
              </Button>
            }
            size="large"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
            }}
            suffix={translateSuffix}
            style={{
              boxShadow: isDarkMode ? '0px 0px 8px rgba(255, 255, 255, 0.4)' : '0px 0px 8px rgba(0, 0, 0, 0.4)',
              borderRadius: '5px',
              width: '50vw',
              minWidth: '350px',
              marginTop: '8vh',
            }}
            readOnly={generationLoading || translationLoading || deletingImageURL !== ''}
          />
          <DynamicTimeline mode="left" items={items} reverse={true} style={{ marginTop: '5vh' }} />
        </DynamicFlex>
      </DynamicApp>
    </DynamicConfigProvider>
  )
}
