"use server";
import { Ai } from '@cloudflare/ai'
interface TranslateResponse {
    message: string;
    status: boolean;
    translated_text: string;
}
export default async function TranslateAction(text: string): Promise<TranslateResponse> {
    "use server";
    try{
        const ai = new Ai(process.env.AI);

        const response = await ai.run('@cf/meta/m2m100-1.2b', {
            text,target_lang: "en"
        });
        
        if(response){
            return {message:'Translated successfully', status:true ,translated_text: response.translated_text}
        }
        return {message:'Translation returns empty',status:false, translated_text: ''};
    }
    catch(e:any){
        return {message: "Translation error: "+e.message,status:false, translated_text: ''}
    }
}