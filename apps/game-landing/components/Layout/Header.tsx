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
      className="absolute top-[10px] left-0 right-0 mx-auto w-[90%] px-4 md:px-8 bg-white/24 rounded-[50px] shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[5.1px] border border-white/37 z-[100] flex justify-between items-center h-20"
      id="test"
    >
      <div className="flex items-center pl-2 md:pl-6">
        <div className="relative w-14 h-14 md:w-16 md:h-16">
          <Link href="/" className="relative w-full h-full block">
            <Image
              src="/land_of_landless_logo-round.png"
              alt="lol logo"
              fill
              priority
              className="object-contain"
            />
          </Link>
        </div>
      </div>

      <div className="flex items-center">
        <nav className="hidden md:flex items-center">
          {pages.map((page) => (
            <Link
              href={page.to}
              key={page.to}
              target={page.target}
              prefetch={page.prefetch}
              className="mx-6"
            >
              <div className="text-white text-[1.2rem] hover:text-orange-200 transition-colors">
                {page.label}
              </div>
            </Link>
          ))}
        </nav>

        <div className="flex items-center ml-2">
          <HeaderSocials />
          <button
            aria-label="open side drawer button"
            className="flex justify-center items-center cursor-pointer ml-6 p-2 hover:bg-white/10 rounded-full transition-colors"
            onClick={() => handleOpen()}
          >
            <Menu size={32} color="white" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
