"use server";
import { Ai } from '@cloudflare/ai'
interface DeleteImageResponse {
    message: string;
    status: boolean;
}
export default async function DeleteImageAction(filename: string): Promise<DeleteImageResponse> {
    "use server";
    try{
        await process.env.KV.delete(filename);
        return {message: "The image has been deleted, please wait for the KV edge node cache to be refreshed", status: true}
    }
    catch(e:any){
        return {message: "Picture deletion error: "+e.message,status:false}
    }
}