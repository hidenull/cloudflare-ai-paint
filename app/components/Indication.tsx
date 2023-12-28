import Button from "antd/es/button";
import Search from "antd/es/input/Search";
import { Input } from 'antd';
import Image from "antd/es/image";
import { useEffect, useState } from "react";
import Tooltip from "antd/es/tooltip";
import Spin from "antd/es/spin";
import message from "antd/es/message";
import TranslateAction from "../actions/TranslateAction";
import GenerateAction from "../actions/GenerateAction";
import { InserImageLocalStorage } from "../utils";
import Timeline, { TimelineProps } from "antd/es/timeline/Timeline";
import ImageCard from "./ImageCard";
import { Flex } from "antd";
export default function Indication({ isDarkMode }: { isDarkMode: boolean }) {
    const [translationLoading, setTranslationLoading] = useState(false);
    const [generationLoading, setGenerationLoading] = useState(false);
    const [inputText, setInputText] = useState('');
    const [items, setItems] = useState<TimelineProps['items']>([]);


    const handleGenerateImage = async () => {
        if (inputText.length == 0) {
            message.error("请输入提示词");
            return;
        }
        setGenerationLoading(true);

        await GenerateAction(inputText).then(res => {
            if (res.status) {
                // Save image info to local storage and web front-end
                InserImageLocalStorage(res.image_url, inputText);
                setItems(prevItems => [...(prevItems || []), {
                    key: res.image_url,
                    children: (<ImageCard prompt={inputText} image_url={res.image_url} setItems={setItems} />),
                }]);
                setInputText('');
                message.success("生成成功");
            } else {
                message.error("生成失败: " + res.message);
            }
        }).catch(err => {
            message.error("生成错误: " + err);
        }).finally(() => {
            setGenerationLoading(false);
        })
    }

    const handleTranslateText = async () => {
        if (inputText.length == 0) {
            message.error("请输入提示词");
            return;
        }
        setTranslationLoading(true);
        await TranslateAction(inputText).then(res => {
            if (res.status) {
                setInputText(res.translated_text);
                message.success("翻译完成");
            } else {
                message.error("翻译失败: " + res.message);
            }
        }).catch(err => {
            message.error("翻译错误: " + err);
        }).finally(() => {
            setTranslationLoading(false);
        });
    }

    useEffect(() => {
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
                            <ImageCard prompt={item.prompt} image_url={item.image_url} setItems={setItems} />
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
    }, []);

    return (
        <Flex
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
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end', // 将Button置于最右侧
                width: '50vw',
                minWidth: '350px',
                marginTop: '8vh',
                boxShadow: isDarkMode ? '0px 0px 8px rgba(255, 255, 255, 0.4)' : '0px 0px 8px rgba(0, 0, 0, 0.4)',
                borderRadius: '10px',
                height: '5vh',
                maxHeight: '45px',
                minHeight: '30px'
            }}>
                <div style={{
                    position: 'relative',
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                }}>
                    <input
                        placeholder="请输入指示词"
                        value={inputText}
                        onChange={(e) => { setInputText(e.target.value); }}
                        readOnly={generationLoading || translationLoading}
                        aria-readonly={generationLoading || translationLoading}
                        autoFocus={true}
                        style={{
                            backgroundColor: isDarkMode ? 'black' : 'white',
                            borderRadius: '10px',
                            outline: 'none',
                            height: '100%',
                            marginInline: '0.5vw',
                            width: '100%'
                        }}
                    />

                </div>
                {inputText.length > 0 &&
                    <>
                        <Tooltip title={translationLoading ? '翻译中' : '翻译为英文,提高模型效率'}>
                            {translationLoading || generationLoading ?
                                <Spin style={{ marginRight: '0.25vw' }} /> :
                                <Image preview={false}
                                    onClick={handleTranslateText}
                                    src='/translate.svg'
                                    alt="Translate"
                                    width={18}
                                    height={18}
                                    style={{
                                        userSelect: 'none',
                                    }} />}
                        </Tooltip>
                        <Button
                            type="primary"
                            loading={generationLoading || translationLoading}
                            onClick={handleGenerateImage}
                            disabled={generationLoading || translationLoading}
                            style={{
                                color: isDarkMode ? 'white' : 'ButtonText',
                                height: '100%',
                                border: isDarkMode ? '1px solid rgba(255,255,255,0.2)':'1px solid rgba(0, 0, 0, 0.1)',
                                width: '60px',
                                marginLeft: '8px'
                            }}
                        >Run</Button>
                    </>
                }
            </div>

            <Timeline mode="left" items={items} reverse={true} style={{ marginTop: '5vh' }} />
        </Flex>
    )
}