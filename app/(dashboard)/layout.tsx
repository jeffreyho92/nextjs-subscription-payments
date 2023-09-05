'use client';

import { useEffect, useState, PropsWithChildren } from "react";
import MobileSiderbar from "./MobileSidebar";
import Sidebar from "./Sidebar";
// import useAnalytics from "@/hooks/useAnalytics";

export default function DashboardLayout({ children }: PropsWithChildren) {
  const [isComponentVisible, setIsComponentVisible] = useState(false);
  // const { trackEvent } = useAnalytics();
  // useEffect(() => {
  //   trackEvent("page.view", { page: "home" });
  // }, []);

  const toggleComponentVisibility = () => {
    setIsComponentVisible(!isComponentVisible);
  };

  return (
    <main className="overflow-hidden w-full h-screen relative flex">
      {isComponentVisible ? (
        <MobileSiderbar toggleComponentVisibility={toggleComponentVisibility} />
      ) : null}
      <div className="dark hidden flex-shrink-0 bg-zinc-900 md:flex md:w-[240px] md:flex-col">
        <div className="flex h-full min-h-0 flex-col ">
          <Sidebar />
        </div>
      </div>
          {children}
    </main>
  );
};