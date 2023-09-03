'use client';

import { useState, useEffect } from 'react';
import DragNDrop from './DragNDrop';
import Spinner from '@/components/ui/Spinner';
import Chat from "../Chat";
import dynamic from "next/dynamic";
import { FaGear, FaDownload } from "react-icons/fa6";
import Select, { SingleValue } from 'react-select';
import Link from 'next/link';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

const PDFviewer = dynamic(() => import("./PDFviewer"), {
  ssr: false,
});

const uploadFileAPI : string = process.env.REACT_UPLOAD_FILE_API || 'http://localhost:3333/claim/process-claim';

type selectOptionType = {
  value: string,
  label: string
}

const Workspace = (props: any) => {
  const [data, setData] = useState<object | null>(null);
  const [loading, setLoading] = useState(true);
  const [arrFiles, setArrFiles] = useState<selectOptionType[]>([]);
  const [selectedFile, setSelectedFile] = useState<SingleValue<selectOptionType>>(null);
  const [selectedFileUrl, setSelectedFileUrl] = useState("/dummy.pdf");

  var workspace_id = props.workspaceId;
  workspace_id = 'f4c812ac-5af5-411e-9ec2-4c80b202cddc';

  useEffect(() => {
    initial();
  }, []);

  var handleFileChange = (option: SingleValue<selectOptionType>) => {
    if(!option?.value) return;

    var selected = { value: option.value || '', label: option.label || '' };
    setSelectedFile(selected);
    setSelectedFileUrl(generateFileUrl(option.value));
  };

  const initial = async () => {
    setLoading(true);

    //get list of files by workspace_id
    const response = await fetch("http://localhost:3000/api/workspace/"+workspace_id);
    const data = await response.json();
    // setData(data);
    console.log('data', data)
    if(!data?.success) return;

    var arr:selectOptionType[] = [];
    var files = data.response || []
    for (let i = 0; i < files.length; i++) {
      arr.push({
        label: files[i].filename,
        value: files[i].id,
      });
    }

    setLoading(false);

    setArrFiles(arr);
    setSelectedFile(arr[0]);
    setSelectedFileUrl(generateFileUrl(arr[0].value));
  };

  var generateFileUrl = (file_id: string) => {
    return `http://localhost:3000/api/workspace/${workspace_id}/file/${file_id}`;
  };

  const fileLoaded = async (file: any) => {
    console.log('fileLoaded', file);
    if (!file) {
      return;
    }

    // setFile(file);
    setLoading(true);
    setData({});

    const data = new FormData();
    data.append('files', file);
    const response = await fetch(uploadFileAPI, {
      method: 'POST',
      body: data,
    });
    if (!response.ok) {
      console.log('response error', response);
    }
    const result = await response.json();
    console.log('result', result);
    if(result){
      setData(result);
    }

    setLoading(false);
  };

  return (
    <PanelGroup autoSaveId="workspace" direction="horizontal">
      <Panel defaultSize={50} minSize={40}>
        <div className="w-full p-5" >
          <Link href={`/workspace/${props.workspaceId}/details`}>
            <span className='inline-flex items-center mb-5 cursor-pointer	'>
              <b>Wordspace1</b>
              &emsp;
              <FaGear className="h-4 w-4" />
            </span>
          </Link>

          {
            selectedFile && 
            <div className="w-full inline-flex items-center mb-5">
              <Select
                defaultValue={selectedFile}
                onChange={handleFileChange}
                options={arrFiles}
                styles={{
                  // Fixes the overlapping problem of the component
                  menu: provided => ({ ...provided, zIndex: 9999, color: 'black' })
                }}
                className='w-11/12'
              />
              <button className="ml-4" onClick={()=> window.open(selectedFileUrl, "_blank")}>
                <FaDownload />
              </button>
            </div>
          }
          {/* <div className="my-5 bg-zinc-800 rounded-lg p-2 flex flex-col items-center">
            {
              arrFiles.map((item, index)=> {
                var normalClass = "bg-zinc-800"
                if(selectedIndex == index) {
                  normalClass = "bg-zinc-700"
                }
                return <div className={'w-full py-2 px-5 text-white rounded-lg '+normalClass}>
                  {index+1 + '. '}
                  {item.name}
                </div>
              })
            }
          </div> */}
          {/* <div style={{ height: '80vh', maxHeight: '40em', margin: 'auto' }} >
            <DragNDrop fileLoaded={fileLoaded} />
          </div> */}
          {
            // selectedFile && <PDFviewer pdfURL={selectedFile} />
            <PDFviewer pdfURL={selectedFileUrl} />
            // <PDFviewer pdfURL="http://localhost:3000/api/workspace/f4c812ac-5af5-411e-9ec2-4c80b202cddc/file/11d80e53-7d0c-4b72-97f7-6670acf1664e" />
          }
          {loading && (
            <div className="grid grid-cols-1 mt-4">
              <div className="m-auto">
                <Spinner />
              </div>
              {/* <p className="p-2 text-gray-500">File loading...</p> */}
            </div>
          )}
        </div>
      </Panel>
      <ResizeHandle />
      <Panel defaultSize={50} minSize={40}>
        <div className='flex h-full'>
          <Chat workspaceId={props.workspaceId} />
        </div>
        {/* <Chat toggleComponentVisibility={toggleComponentVisibility} /> */}
        {/* {(loading || data) && (
          <div className="w-1/2 p-10">
            {loading && (
              <div className="grid grid-cols-1">
                <div className="m-auto">
                  <Spinner />
                </div>
                <p className="p-2 text-gray-500">Claim processing...</p>
              </div>
            )}
            {
              // !loading && data && <ClaimDetails data={data} />
            }
          </div>
        )} */}
      </Panel>
    </PanelGroup>
  );
};

function ResizeHandle({
  className = "",
  id
}: {
  className?: string;
  id?: string;
}) {
  return (
    <PanelResizeHandle
      // className={[styles.ResizeHandleOuter, className].join(" ")}
      // cursor: ew-resize; touch-action: none; user-select: none;
      className={[className].join(" ")}
      id={id}
    >
      {/* <div className={styles.ResizeHandleInner}>
        <svg className={styles.Icon} viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M8,18H11V15H2V13H22V15H13V18H16L12,22L8,18M12,2L8,6H11V9H2V11H22V9H13V6H16L12,2Z"
          />
        </svg>
      </div> */}
      {/* <div style={{background: 'rgb(238, 238, 238)', width: 4, height: '100%'}}></div> */}
      <div className="w-1 h-full bg-gray-600" />
    </PanelResizeHandle>
  );
}

export default Workspace;