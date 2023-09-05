'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaDownload, FaTrash } from "react-icons/fa6";
import { generateFileUrl } from '@/utils/helpers';
import { fileType } from './FileList.type';

const FileList = (props: { data: fileType[], workspace_id:string, updateData: Function }) => {
  const { data, workspace_id, updateData } = props;

  const onDelete = (index: number) => {
    data[index].deleted = !data[index].deleted;
    updateData(data);
  }

  return (
    <>
      {
        data.map((item, index) => {
          if(item.deleted) return null;

          return (
            <div className="flex justify-between items-center py-3 border-b-2 border-solid border-gray-600 last:border-none " key={'filelist'+index}>
              <span className="flex items-center text-zinc-300 overflow-hidden">
                {
                  item.id? 
                  <button onClick={() => window.open(generateFileUrl(workspace_id, item.id || ''), "_blank")} >
                    <FaDownload className="h-4 w-4 mr-2"/>
                  </button>
                  :
                  <span className="text-xs font-thin mr-2">[New]</span>
                }
                {item.filename}
              </span>
              <button >
                <FaTrash className="h-4 w-4 text-red-500" onClick={ () => { onDelete(index) }} />
              </button>
            </div>
          )
        })
      }
    </>
  );
}

export default FileList;