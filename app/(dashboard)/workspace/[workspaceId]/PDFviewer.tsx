'use client';

import { useState, useEffect, useCallback } from 'react';
import { SpecialZoomLevel, Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import '@react-pdf-viewer/core/lib/styles/index.css';
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "./PDFviewer.css";
import type {
  ToolbarProps,
  ToolbarSlot,
  TransformToolbarSlot,
} from "@react-pdf-viewer/toolbar";

const PDFviewer = (props: {pdfURL: string}) => {
  const transform: TransformToolbarSlot = (slot: ToolbarSlot) => ({
    ...slot,
    Open: () => <></>,
    Print: () => <></>,
    Rotate: () => <></>,
    RotateBackwardMenuItem: () => <></>,
    RotateForwardMenuItem: () => <></>,
    ShowProperties: () => <></>,
    EnterFullScreen: () => <></>,
    EnterFullScreenMenuItem: () => <></>,
    Download: () => <></>,
    DownloadMenuItem: () => <></>,
    SwitchTheme: () => <></>,
    SwitchThemeMenuItem: () => <></>,
  });

  const renderToolbar = (
    // eslint-disable-next-line no-unused-vars
    Toolbar: (props: ToolbarProps) => React.ReactElement
  ) => <Toolbar>{renderDefaultToolbar(transform)}</Toolbar>;

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    // eslint-disable-next-line no-unused-vars
    sidebarTabs: (defaultTabs) => [],
    renderToolbar,
  });

  const { renderDefaultToolbar } =
    defaultLayoutPluginInstance.toolbarPluginInstance;

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.9.179/build/pdf.worker.min.js">
        <div
            className="rounded-lg overflow-hidden	"
            style={{
                height: '73vh',
                width: '100%',
                maxHeight: '40em',
                // marginLeft: 'auto',
                // marginRight: 'auto',
            }}
        >
        <Viewer
          fileUrl={props.pdfURL}
          plugins={[defaultLayoutPluginInstance]}
          defaultScale={SpecialZoomLevel.PageWidth}
        />
        </div>
    </Worker>
  );
}

export default PDFviewer;