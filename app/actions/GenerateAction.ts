"use server";
import { Ai } from '@cloudflare/ai'
import { headers } from 'next/headers';

interface GenerateResponse {
    message: string;
    status: boolean;
    image_url: string;
}

export default async function GenerateAction(prompt: string): Promise<GenerateResponse> {
    "use server";
    try{
        const header = headers();
        console.log("请求头: ",header);

        const ai = new Ai(process.env.AI);
        
        const imageStream = await ai.run("@cf/stabilityai/stable-diffusion-xl-base-1.0", { prompt: prompt });
        if(!imageStream){
            return { message: 'Image stream returns empty', status: false, image_url: '' };
        }

        const filename = Math.random().toString(36).substring(2, 18) + '.png';
    
        await process.env.KV.put(filename, imageStream, { expirationTtl: 7 * 24 * 60 * 60 });
    
        const image_url = `https://${header.get('host')}/image/${filename}`;
        
        return { message: 'Generated successfully', status: true, image_url };
    }
    catch(e:any){
        return { message: 'Generate Error: ' +e.message, status: false, image_url: '' };
    }
}