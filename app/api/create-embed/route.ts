// import scrape from '@/scripts/scrape-embed';
// console.log('scrape-embed run 1')
// scrape();
// console.log('scrape-embed run 2')

export async function GET(req: Request) {
  return new Response(JSON.stringify({ success: true }), {
    status: 200
  });
}
