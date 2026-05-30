import Image from "next/image";
import Link from "next/link";

function HeaderSocials() {
  return (
    <div className="hidden items-center gap-3 md:flex">
      <Link
        href="https://twitter.com/thelolxyz"
        target="_blank"
        rel="noopener noreferrer"
        className="relative h-10 w-10 shrink-0 transition-opacity hover:opacity-80"
        aria-label="Follow on X"
      >
        <Image src="/icons/x_icon.png" alt="" fill className="object-contain" />
      </Link>
      <Link
        href="https://discord.gg/DKpvyqBf78"
        target="_blank"
        rel="noopener noreferrer"
        className="relative h-10 w-10 shrink-0 transition-opacity hover:opacity-80"
        aria-label="Join Discord"
      >
        <Image
          src="/icons/discord_icon.png"
          alt=""
          fill
          className="object-contain"
        />
      </Link>
    </div>
  );
}

export default HeaderSocials;
