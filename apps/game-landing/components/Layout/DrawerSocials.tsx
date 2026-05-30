import Image from "next/image";
import Link from "next/link";

const DrawerSocials = () => {
  return (
    <div className="flex justify-center items-center space-x-12">
      <div className="relative w-16 h-16 transition-transform hover:scale-110">
        <Link
          href="https://twitter.com/thelolxyz"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image src="/icons/x_icon.png" alt="twitter logo" fill />
        </Link>
      </div>
      <div className="relative w-16 h-16 transition-transform hover:scale-110">
        <Link
          href="https://discord.gg/DKpvyqBf78"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image src="/icons/discord_icon.png" alt="discord logo" fill />
        </Link>
      </div>
    </div>
  );
};

export default DrawerSocials;
