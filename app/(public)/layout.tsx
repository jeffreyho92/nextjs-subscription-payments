

import { PropsWithChildren } from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

export default function PublicLayout({ children }: PropsWithChildren) {
    return (
      <div className="bg-black">
        <Navbar />
        <main
          id="skip"
          className="min-h-[calc(100dvh-4rem)] md:min-h[calc(100dvh-5rem)]"
        >
          {children}
        </main>
        <Footer />
      </div>
    );
};