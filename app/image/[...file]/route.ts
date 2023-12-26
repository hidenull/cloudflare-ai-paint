import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const filename = url.pathname.split('/image/')[1];

  const imageStream = await process.env.KV.get(filename, 'stream');

  if (!imageStream) {
    return new Response(
      JSON.stringify({ message: 'Image not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  return new Response(
    imageStream, 
    { status: 200, headers:{'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=604800'} }
    );
}

export async function DELETE(request: NextRequest) {
  const url = new URL(request.url);
  const filename = url.pathname.split('/image/')[1];

  const result = await process.env.KV.delete(filename);

  if (result === null) {
    return new Response(
      JSON.stringify({ message: 'Image not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }
  return new Response(
    JSON.stringify({ message: 'Image deleted' }),
    { status: 202, headers: { 'Content-Type': 'application/json' } }
  );
}
