'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import Button from '@/components/ui/Button';
import FileList from './FileList';
import { fileType } from './FileList.type';
import DragNDrop from '../DragNDrop';
import Spinner from '@/components/ui/Spinner';
import { getURL } from '@/utils/helpers';

const WorkspaceDetail = (props: { workspace: { workspace_name: string }, files: fileType[], workspace_id:string }) => {
  const { workspace, files, workspace_id } = props;

  // const [count, setCount] = useState(0);
  const [arrFile, setArrFile] = useState<fileType[]>(files);
  const [loading, setLoading] = useState(false);

  const updateArrFile = (arr: fileType[]) => {
    arr = JSON.parse(JSON.stringify(arr)); //clone
    setArrFile(arr);
  }

  const fileLoaded = async (newFiles: any) => {
    console.log('newFiles', newFiles)
    if (!newFiles) {
      return;
    }

    var arr: fileType[] = JSON.parse(JSON.stringify(arrFile));
    for (let i = 0; i < newFiles.length; i++) {
      arr.push({
        filename: newFiles[i].name,
        new: true,
        file: newFiles[i],
      });
    }
    setArrFile(arr);
  };
    
  const onSubmit = async () => {
    setLoading(true);
    console.log('arrFile', arrFile)

    const formData = new FormData();
    for (let i = 0; i < arrFile.length; i++) {
      if(arrFile[i].new){
        formData.append('newFiles', arrFile[i].file || new Blob, arrFile[i].filename);
      }
    }
    
    var url = `${getURL()}/api/workspace/${workspace_id}`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      console.log('response error', response);
    }
    const result = await response.json();
    console.log('result', result);
    // if(result){
    //   setData(result);
    // }

    setLoading(false);
  };

  return (
    <div className="w-full p-4 overflow-y-auto">
      <Card
        title="Workspace"
        // description=""
        footer={
          <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
            <p className="pb-4 sm:pb-0"></p>
            <Button
              variant="slim"
              type="submit"
              form="nameForm"
              disabled={loading}
              onClick={onSubmit}
            >
              { loading && <> <Spinner width={1.5} /> &nbsp; </>  }
              Update
            </Button>
          </div>
        }
      >
        <div className="mt-8 mb-4 text-md font-semibold">
          <p className="mb-2 text-zinc-300">Name</p>
          <input
            type="text"
            name="name"
            className="w-1/2 p-3 rounded-md bg-zinc-800 mb-6"
            defaultValue={workspace?.workspace_name || ''}
            placeholder="Workspace name"
            maxLength={64}
          />
          <p className="mb-2 text-zinc-300">Document(s)</p>
          {
            arrFile &&
            <div className="w-1/2 px-3 rounded-md bg-zinc-800 mb-4">
              <FileList data={arrFile} workspace_id={workspace_id} updateData={updateArrFile} />
            </div>
          }
          <div style={{ height: '30vh', maxHeight: '20em', margin: 'auto' }} >
            <DragNDrop fileLoaded={fileLoaded} />
          </div>
        </div>
      </Card>
    </div>
  );
}

interface Props {
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
}

function Card({ title, description, footer, children }: Props) {
  return (
    <div className="w-full m-auto border rounded-md p border-zinc-700 bg-zinc-900">
      <div className="px-5 py-4">
        <h4 className="mb-1 text-2xl font-medium">{title}</h4>
        <p className="text-zinc-300">{description}</p>
        {children}
      </div>
      <div className="p-4 border-t rounded-b-md border-zinc-700 bg-zinc-900 text-zinc-500">
        {footer}
      </div>
    </div>
  );
}

export default WorkspaceDetail;