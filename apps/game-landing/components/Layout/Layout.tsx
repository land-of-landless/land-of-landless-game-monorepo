import { PropsWithChildren } from "react";
import Header from "./Header";
import Footer from "./Footer";

function Layout({ children }: PropsWithChildren) {
  return (
    <div className="pt-4 w-full">
      <Header handleOpen={() => {}} />
      <main className="min-h-[90vh]">{children}</main>
      <Footer />
    </div>
  );
}

export default Layout;
