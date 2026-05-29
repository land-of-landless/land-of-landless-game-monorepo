import { PropsWithChildren } from "react";
import useToggle from "../../hooks/useToggle";
import Header from "./Header";
import Footer from "./Footer";
import Drawer from "./Drawer";

function Layout({ children }: PropsWithChildren) {
  const [drawerOpen, toggleDrawer] = useToggle(false);

  return (
    <div className="pt-4 w-full">
      <Drawer state={drawerOpen} handleClose={toggleDrawer} />
      <Header handleOpen={toggleDrawer} />
      <main className="min-h-[90vh]">{children}</main>
      <Footer />
    </div>
  );
}

export default Layout;
