import {
  getSession,
  getUserDetails,
  getSubscription
} from '@/app/supabase-server';
import { Database } from '@/types_db';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { supabaseClient } from '@/utils/supabase-client';
import { fileType } from './FileList.type';
import WorkspaceDetail from './WorkspaceDetail';

export default async function WorkspaceDetailsPage({ params }: { params: { workspaceId: string } }) {
  const [session, userDetails, subscription] = await Promise.all([
    getSession(),
    getUserDetails(),
    getSubscription()
  ]);
  // const user = session?.user;
  // if (!session) {
  //   return redirect('/signin');
  // }

  var workspace_id = params.workspaceId;
  workspace_id = 'f4c812ac-5af5-411e-9ec2-4c80b202cddc';
  
  console.log('createServerActionClient supabase', workspace_id)

  let { data: workspace } = await supabaseClient
  .from('workspaces')
  .select('*')
  .eq('id', workspace_id)
  .is('deleted_at', null)
  .single();
  
  let result = await supabaseClient
  .from('files')
  .select('*')
  .eq('workspace_id', workspace_id)
  .is('deleted_at', null);
  var files: fileType[] = result.data || [];

  const updateName = async (formData: FormData) => {
    'use server';

    const newName = formData.get('name') as string;
    const supabase = createServerActionClient<Database>({ cookies });
    const session = await getSession();
    const user = session?.user;
    const { error } = await supabase
      .from('users')
      .update({ full_name: newName })
      .eq('id', user?.id);
    if (error) {
      console.log(error);
    }
    // revalidatePath('/account');
  };

  // const updateName = async () => {
  //   'use server';

  //   const supabase = createServerActionClient<Database>({ cookies });
  //   const session = await getSession();
  //   const user = session?.user;
  //   const data = await supabase
  //     .from('workspace')
  //     .select('*')
  //     // .eq('id', user?.id)
  //     .eq('workspace_id', workspace_id)
  //     .is('deleted_at', null);
  //     console.log('data', data)
  // };

  return (
    <WorkspaceDetail workspace={workspace} workspace_id={workspace_id} files={files} />
  );
}
