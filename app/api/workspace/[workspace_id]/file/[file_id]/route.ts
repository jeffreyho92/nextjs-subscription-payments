import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types_db'
import { supabaseClient } from '@/utils/supabase-client';

// export async function GET(req: NextRequest, res: NextApiResponse) {
// export async function GET() {
export async function GET(req: NextRequest, { params }: { params: { workspace_id: string, file_id: string } }) {
  const file_id = params.file_id;
  const workspace_id = params.workspace_id;
  console.log('file_id', file_id);
  console.log('workspace_id', workspace_id);

  if(!file_id || !workspace_id){
    return NextResponse.json({ success: false, error: "params missing" }, { status: 400 });
  }

  // get all files
  const { data, error } = await supabaseClient.storage.from('workspaces').download(workspace_id+"/"+file_id);
  console.log('data', data);
  console.log('error', error);

  // //get file_id from workspace_id
  // var files = await getFilesByWorkspace_id(workspace_id);
  // console.log('files', files)

  // return NextResponse.json({ success: true, response: { text: "This is a response from AI!" } });

  // var res = Response;
  // // Set the Content-Type header to application/octet-stream.
  // res.setHeader('Content-Type', 'application/octet-stream');

  // // Set the Content-Disposition header to attachment; filename=my-pdf.pdf.
  // res.setHeader('Content-Disposition', 'attachment; filename=my-pdf.pdf');

  // Return the PDF file data.
  // res.send(data);
  return new Response(data, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename=my-pdf.pdf',
    },
  })
}


// type File = Database['public']['Tables']['files']['Row'];
const getFilesByWorkspace_id = async (workspace_id: string): Promise<string[]> => {
  console.log('workspace_id', workspace_id)
  let { data: files, error } = await supabaseClient
  .from('files')
  .select('id')
  .eq('workspace_id', workspace_id)
  .is('deleted_at', null);

  if(error) console.log('error', error);

  var result = [];
  if(files){
    result = files.map((item)=> {  return item.id; });
  }

  return result;
}
