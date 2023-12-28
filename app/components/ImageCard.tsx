import DeleteOutlined from '@ant-design/icons/lib/icons/DeleteOutlined'
import { Card, Image, Spin, Tooltip, message } from 'antd'
import { useState } from 'react';
import DeleteImageAction from '../actions/ImageAction';
import { DeleteImageLocalStorage } from '../utils';

export default function ImageCard({prompt,image_url,setItems}:{prompt:string,image_url:string,setItems:any}) {
    const [deletingImageURL, setDeletingImageURL] = useState('');
    const handleDeleteImage = async (image_url: string) => {
        setDeletingImageURL(image_url);
        await DeleteImageAction(image_url).then(res => {
          if (res.status) {
            // Delete cached items in local storage and web front-end
            setItems((prevItems: any) => (prevItems || []).filter((item: { key: string; }) => item.key !== image_url));
            DeleteImageLocalStorage(image_url);
            
            message.success(res.message);
          } else {
            message.error("Image deletion failed: " + res.message);
          }
        }).catch(err => {
          message.error("Image deletion failed: " + err);
        }).finally(() => {
          setDeletingImageURL('');
        });
      }
    return (<Card
        hoverable={true}
        size="small"
        title={<Tooltip title={prompt}><span>{prompt.length > 15 ? `${prompt.slice(0, 15)}...` : prompt}</span></Tooltip>}
        extra={deletingImageURL == image_url ? <Spin /> : <DeleteOutlined onClick={() => handleDeleteImage(image_url)} />}
    >
        <Image loading='lazy' src={image_url} alt={image_url} height={200} width={200} />
    </Card>)
}