import { connection } from 'next/server';
export async function GET() {
  await connection();
  return new Response(process.env.NEXT_PUBLIC_DEPLOY_REVISION || 'development', {
    headers: {'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store, max-age=0'},
  });
}
