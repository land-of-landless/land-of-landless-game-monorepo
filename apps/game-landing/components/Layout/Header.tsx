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
  {
    label: "Donate",
    to: "/donation",
    target: "",
    prefetch: false,
  },
];

type Props = {
  handleOpen: () => void;
};

function Header({ handleOpen }: Props) {
  return (
    <header className="absolute top-[10px] inset-x-0 z-[100] mx-4 w-[calc(100%-2rem)] sm:mx-6 sm:w-[calc(100%-3rem)] md:mx-8 md:w-[calc(100%-4rem)]">
      <div className="flex h-14 w-full items-center justify-between gap-4 rounded-[50px] border border-white/37 bg-white/24 px-2 py-10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[5.1px] sm:px-8 md:px-6">
        <Link
          href="/"
          className="relative h-11 w-11 shrink-0 sm:h-12 sm:w-12"
          aria-label="Land of Landless home"
        >
          <Image
            src="/land_of_landless_logo-round.png"
            alt="lol logo"
            fill
            priority
            className="object-contain"
          />
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          <nav className="hidden items-center gap-6 md:flex lg:gap-8">
            {pages.map((page) => (
              <Link
                href={page.to}
                key={page.to}
                target={page.target || undefined}
                prefetch={page.prefetch}
                className="text-[1.2rem] font-medium text-white transition-opacity hover:opacity-80"
              >
                {page.label}
              </Link>
            ))}
          </nav>

          <HeaderSocials />

          <button
            type="button"
            className="flex shrink-0 cursor-pointer items-center justify-center rounded-full p-1.5 text-white transition-colors hover:bg-white/10"
            onClick={handleOpen}
            aria-label="Open navigation menu"
          >
            <Menu size={28} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
