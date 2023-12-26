import type { NextRequest } from 'next/server'
import { Ai } from '@cloudflare/ai'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
    if (!request.headers.get('Content-Type')?.includes('application/json')) {
        return new Response(
            JSON.stringify({ message: 'Unsupported Media Type' }),
            { status: 415, headers: { 'Content-Type': 'application/json' } }
        );
    }

    try {
        const ai = new Ai(process.env.AI);

        const { source_lang, target_lang, text_list } = await request.json() as any;
        if (!Array.isArray(text_list) || text_list.length < 1) {
            return new Response(JSON.stringify({ message: 'Invalid text_list' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        const translations = await Promise.all(text_list.map(async (text: string) => {
            const aiParams: any = {
                text,
                target_lang: target_lang === "zh-CN" ? "chinese" : target_lang
            };
            if (source_lang && source_lang !== "auto") {
                aiParams.source_lang = source_lang;
            }
            const response = await ai.run('@cf/meta/m2m100-1.2b', aiParams);
            return {
                detected_source_lang: source_lang,
                text: response.translated_text
            };
        }));

        return new Response(
            JSON.stringify({ translations, message: 'ok' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.log("Internal Server Error", error);
        return new Response(
            JSON.stringify({ message: 'Internal Server Error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
