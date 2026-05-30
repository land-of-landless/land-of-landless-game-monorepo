import React from "react";
import { motion } from "framer-motion";
import { semangatRegular, lenasRegular } from "@/fonts";
import { Swords, Gift, RefreshCcw } from "lucide-react";

const roadmapItems = [
  {
    title: "Simon Emperor says",
    description: "Complete missions soldier!",
    subDescription: "For LOL! For Expansion! For Juicy Prizes!",
    icon: <Swords className="text-orange-600" size={32} />,
    color: "border-orange-200",
    bgColor: "bg-orange-50",
    side: "left",
  },
  {
    title: "Let's share a memecoin!",
    description: "Gamer🎮 or a Degen🐒, you're welcome!",
    subDescription: "You do missions, Emperor gives you candy!",
    icon: <Gift className="text-red-600" size={32} />,
    color: "border-red-200",
    bgColor: "bg-red-50",
    side: "right",
  },
  {
    title: "Help Emperor Tai Colonize!",
    description: "Ops! Emperor spotted new planets",
    subDescription: "we need help, invite your friends!",
    icon: <RefreshCcw className="text-green-600" size={32} />,
    color: "border-green-200",
    bgColor: "bg-green-50",
    side: "left",
  },
];

const RoadMap = () => {
  return (
    <section
      id="roadmap"
      className="py-[320px] bg-[#fdfaf1] relative overflow-hidden flex flex-col items-center"
    >
      <h2
        className={`${lenasRegular.className} text-5xl md:text-7xl font-bold mb-24 text-center text-gray-900`}
      >
        Explain like I&apos;m 5
      </h2>

      <div className="relative w-full max-w-4xl px-4 flex flex-col items-center">
        {/* Vertical Line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-orange-300" />

        <div className="space-y-64 w-full">
          {roadmapItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: item.side === "left" ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`flex items-center w-full ${
                item.side === "left" ? "flex-row" : "flex-row-reverse"
              }`}
            >
              {/* Content */}
              <div
                className={`w-[45%] ${
                  item.side === "left" ? "text-right pr-12" : "text-left pl-12"
                }`}
              >
                <h3
                  className={`${semangatRegular.className} text-4xl text-blue-800 mb-2`}
                >
                  {item.title}
                </h3>
                <p className="text-lg text-gray-700">{item.subDescription}</p>
              </div>

              {/* Icon Circle */}
              <div className="relative z-10 w-16 h-16 flex items-center justify-center bg-white border-4 border-orange-400 rounded-full shadow-lg shrink-0">
                {item.icon}
              </div>

              {/* Description */}
              <div
                className={`w-[45%] ${
                  item.side === "left" ? "text-left pl-12" : "text-right pr-12"
                }`}
              >
                <h4 className="text-3xl font-bold text-gray-900 mb-2">
                  {item.description}
                </h4>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoadMap;
