import Image from "next/image";
import { Menu } from "lucide-react";
import Link from "next/link";
import HeaderSocials from "./HeaderSocials";

const pages = [
  {
    label: "Game",
    to: "https://game.thelol.xyz",
    target: "_blank",
    prefetch: false,
  },
];

type Props = {
  handleOpen: () => void;
};

function Header({ handleOpen }: Props) {
  return (
    <header
      className="absolute top-[10px] left-0 right-0 mx-auto w-[90%] px-4 bg-white/24 rounded-[50px] shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[5.1px] border border-white/37 z-[100] flex"
      id="test"
    >
      <div className="flex justify-between items-center h-20 w-full bg-transparent shadow-none">
        <div className="flex justify-between w-full">
          <div className="flex justify-center items-center relative w-16 h-16 my-auto">
            <Link href="/" className="relative w-full h-full">
              <Image
                src="/land_of_landless_logo-round.png"
                alt="lol logo"
                fill
                priority
                className="object-contain"
              />
            </Link>
          </div>

          <div className="grow-[2]"></div>

          <nav className="hidden md:flex grow justify-end">
            {pages.map((page) => (
              <Link
                style={{ margin: "0 0.8rem" }}
                href={page.to}
                key={page.to}
                target={page.target}
                prefetch={page.prefetch}
                className="my-auto"
              >
                <div className="my-4 text-white block text-[1.2rem]">
                  {page.label}
                </div>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <HeaderSocials />

      <div
        className="flex justify-center items-center cursor-pointer"
        onClick={() => handleOpen()}
      >
        <Menu size={32} color="white" />
      </div>
    </header>
  );
}

export default Header;
