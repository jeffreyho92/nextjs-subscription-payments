import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse, NextFetchEvent } from 'next/server'
import type { Database } from '@/types_db'
import { supabaseClient } from '@/utils/supabase-client';
// import { createEdgeRouter } from "next-connect";
// const multer = require("multer");
// const upload = multer();

// import formidable from "formidable";
// import { IncomingForm } from 'formidable';


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

// const productImages = [
//     { name: 'newFiles'},
// ];
// // const uploadMiddleware = upload.fields(productImages);
// const uploadMiddleware = upload.array('newFiles', 10);

// interface RequestContext {
//   params: {
//     id: string;
//   };
// }

// const router = createEdgeRouter<NextRequest, RequestContext>();

// router
//   // A middleware example
//   // .use(async (req, event, next) => {
//   //   const start = Date.now();
//   //   await next(); // call next in chain
//   //   const end = Date.now();
//   //   console.log(`Request took ${end - start}ms`);
//   // })
//   // .get((req) => {
//   //   const id = req.params.id;
//   //   const user = getUser(id);
//   //   return NextResponse.json({ user });
//   // })
//   .use(uploadMiddleware)
//   .post(async (req) => {
//     // const id = req.params.id;
//     // if (req.user.id !== id) {
//     //   throw new ForbiddenError("You can't update other user's profile");
//     // }
//     // const user = await updateUser(req.body.user);
//     // console.log('req', req)
//     // const data = await req.formData()
//     // const newFiles: File[] | null = data.get('newFiles') as unknown as File[]
//     // console.log('newFiles', newFiles)

//     var form = formidable({});
//     // var form = new IncomingForm();
//     form.parse(req, function (err, fields, files) {
//       console.log("fields", fields);
//     });

//     return NextResponse.json({ success: true })

//   });


// export async function POST(request: NextRequest, ctx: RequestContext) {
//   return router.run(request, ctx);
// }

export async function POST(request: NextRequest) {

  const data = await request.formData();
  const files: File[] = data.getAll('newFiles') as unknown as File[]
  console.log('files', files)
  for (var i = 0; i < files.length; i++) {
    console.log('files[i]', files[i])
    console.log('files[i].name', files[i].name)
  }
  if (!files) {
    return NextResponse.json({ success: false })
  }


  // const bytes = await file.arrayBuffer()
  // const buffer = Buffer.from(bytes)

  // const path = `/tmp/${file.name}`
  // await writeFile(path, buffer)
  // console.log(`open ${path} to see the uploaded file`)

  return NextResponse.json({ success: true })
}