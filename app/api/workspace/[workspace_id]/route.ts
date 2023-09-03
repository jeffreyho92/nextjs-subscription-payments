import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types_db'
import { supabaseClient } from '@/utils/supabase-client';

// export async function GET(req: NextRequest, res: NextApiResponse) {
// export async function GET() {
// export async function GET(req: NextApiRequest) {
export async function GET( req: Request, { params }: { params: { workspace_id: string } }) {
  const workspace_id = params.workspace_id;
  console.log('workspace_id', workspace_id);

  if(!workspace_id){
    return NextResponse.json({ success: false, error: "params missing" }, { status: 400 });
  }

  //get all files by workspace_id
  var files = await getFilesByWorkspace_id(workspace_id);
  console.log('files', files)

  return NextResponse.json({ success: true, response: files });
}


// type File = Database['public']['Tables']['files']['Row'];
const getFilesByWorkspace_id = async (workspace_id: string): Promise<string[]> => {
  console.log('workspace_id', workspace_id)
  let { data: files, error } = await supabaseClient
  .from('files')
  .select('*')
  .eq('workspace_id', workspace_id)
  .is('deleted_at', null);

  if(error) console.log('error', error);

  var result = files || [];
  return result;
}
