import type { NextRequest } from 'next/server';
import { Ai } from '@cloudflare/ai';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
    if (!request.headers.get('Content-Type')?.includes('application/json')) {
        return new Response(
            JSON.stringify({ message: 'Unsupported Media Type' }),
            { status: 415, headers: { 'Content-Type': 'application/json' } }
        );
    }


    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
        return new Response(
            JSON.stringify({ message: 'Invalid prompt' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    try {
        const ai = new Ai(process.env.AI);

        const imageStream = await ai.run("@cf/stabilityai/stable-diffusion-xl-base-1.0", { prompt: prompt });

        // Generate a random filename for the image
        const filename = Math.random().toString(36).substring(2, 18) + '.png';

        // Store the image stream in KV
        await process.env.KV.put(filename, imageStream, { expirationTtl: 7 * 24 * 60 * 60 }); // Set expiration time to 7 days

        const image_url = `https://${request.headers.get('host')}/image/${filename}`;
        return new Response(
            JSON.stringify({ image_url, message: 'ok' }),
            { status: 201, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.log("Internal Server Error", error);
        return new Response(
            JSON.stringify({ message: 'Internal Server Error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
