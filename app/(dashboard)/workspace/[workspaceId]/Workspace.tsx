'use client';

import { useState } from 'react';
import DragNDrop from './DragNDrop';
import Spinner from '@/components/ui/Spinner';
import Chat from "../Chat";
import dynamic from "next/dynamic";
import { FaGear } from "react-icons/fa6";
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

var arrFiles:selectOptionType[] = [
  {value: "File1", label: "File A"}, {value: "File2", label: "File B"}, {value: "File3", label: "File C"}
];

const Workspace = (props: any) => {
  const [data, setData] = useState<object | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(arrFiles[0]);

  var handleFileChange = (option: SingleValue<selectOptionType>) => {
    var selected = { value: option?.value || '', label: option?.label || '' };
    setSelectedFile(selected);
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

          <Select
            defaultValue={selectedFile}
            onChange={handleFileChange}
            options={arrFiles}
            styles={{
              // Fixes the overlapping problem of the component
              menu: provided => ({ ...provided, zIndex: 9999, color: 'black' })
            }}
            className='mb-5'
          />
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
            <PDFviewer pdfURL="/dummy.pdf" />
          }
        </div>
      </Panel>
      <ResizeHandle />
      <Panel defaultSize={50} minSize={40}>
        <div className='flex h-full'>
          <Chat />
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