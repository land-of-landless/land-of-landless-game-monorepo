import Image from "next/image";
import Link from "next/link";

type Props = {};

const DrawerSocials = (props: Props) => {
  return (
    <div className="flex justify-center items-center pr-20 pl-12 w-auto h-20 flex-row space-x-4">
      <div className="relative w-12 h-12">
        <Link href={"https://twitter.com/thelolxyz"} target="_blank">
          <Image src={"/icons/x_icon.png"} alt="twitter logo" fill />
        </Link>
      </div>
      <div className="relative w-12 h-12">
        <Link href={"https://discord.gg/DKpvyqBf78"} target="_blank">
          <Image src={"/icons/discord_icon.png"} alt="discord logo" fill />
        </Link>
      </div>
    </div>
  );
};

export default DrawerSocials;
