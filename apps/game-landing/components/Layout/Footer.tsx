import Image from "next/image";
import Link from "next/link";

type Props = {};

const Footer = (props: Props) => {
  return (
    <footer
      id={"footer"}
      className="flex flex-col justify-between items-center bg-[#212121] w-full"
    >
      <div className="flex justify-center items-center p-4 w-full h-24 bg-[#212121] flex-row space-x-4">
        <div className="relative w-12 h-12 md:w-16 md:h-16">
          <Link href={"https://twitter.com/thelolxyz"} target="_blank">
            <Image src={"/icons/x_icon.png"} alt="twitter logo" fill />
          </Link>
        </div>
        <div className="relative w-12 h-12 md:w-16 md:h-16">
          <Link href={"https://discord.gg/DKpvyqBf78"} target="_blank">
            <Image src={"/icons/discord_icon.png"} alt="discord logo" fill />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
