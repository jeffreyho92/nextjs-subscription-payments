'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import styles from './DragNDrop.module.css';

const DragNDrop = (props: any) => {
  // const [count, setCount] = useState(0);
  const [file, setFile] = useState<any>({});

  const onDrop = useCallback((acceptedFiles: any) => {
    // Do something with the files
    // console.log(acceptedFiles);

    // setFile(
    //   Object.assign(acceptedFiles[0], {
    //     preview: URL.createObjectURL(acceptedFiles[0]),
    //   })
    // );
    // props.fileLoaded(acceptedFiles[0]);
    props.fileLoaded(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      // 'image/jpeg': ['.jpg', '.jpeg'],
      // 'image/png': ['.png'],
      'application/pdf': ['.pdf'],
    },
    // noClick: true,
    // maxFiles: 1,
    // multiple: false,
  });

  return (
    <div className={styles.dropzone} {...getRootProps()} >
      <input {...getInputProps()} />
      {file.preview ? (
        file.type == 'application/pdf' ? (
          // <object
          //   width="100%"
          //   height="400"
          //   data={file.preview}
          //   type="application/pdf"
          // >
          //   {' '}
          // </object>
          <iframe
            src={`${file.preview}#toolbar=0`}
            width="100%"
            height="100%"
            style={{
              WebkitTransform: 'scale(0.9)',
              // MozTransform: 'scale(0.5)',
            }}
          />
        ) : (
          <img
            src={file.preview}
            style={{
              maxWidth: '80%',
            }}
            // Revoke data uri after image is loaded
            onLoad={() => {
              URL.revokeObjectURL(file.preview);
            }}
          />
        )
      ) : (
        <>
          <div className="flex flex-col items-center">
            <img
              src="/upload-icon.png"
              style={{ maxWidth: '7em', margin: 'auto', marginTop: '-1em' }}
            />
            {/* <button className="btn btn-blue">
              Choose file(s)
            </button> */}
            <button className="btn btn-primary">Choose file(s)</button>
            <p className="mt-2 text-center text-sm">or drag 'n' drop here</p>
            <p className="mt-2 text-center text-sm">
              <em>
                (Only pdf file will be accepted)
              </em>
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default DragNDrop;