import React from "react";
import {
  Gavel,
  ShieldCheck,
  Info,
  Mail,
  ShieldAlert,
} from "lucide-react";
import Image from "next/image";
import { semangatBold, semangatRegular } from "@/fonts";
import landOfLandlessLogo from "@/public/land_of_landless_logo-round.png";

const Tos = () => {
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#e0e7ff_100%)] py-8 md:py-16 px-4 flex items-center justify-center">
      <div className="w-full max-w-full sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px] xl:max-w-[1200px]">
        <div className="bg-white/98 rounded-[32px] p-12 sm:p-20 md:p-24 lg:p-32 shadow-2xl">
          {/* Hero Section */}
          <div className="text-center mb-8">
            {/* Logo and Brand Section */}
            <div className="mb-6">
              <Image
                src={landOfLandlessLogo}
                alt="Land of Landless Logo"
                width={80}
                height={80}
                className="mx-auto mb-6"
              />
              <h1
                className={`${semangatBold.className} text-[2rem] sm:text-[2.5rem] md:text-[3rem] text-[#FF6B35] mb-4 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.1)]`}
              >
                Land of Landless
              </h1>
              <h2
                className={`${semangatRegular.className} text-[1.2rem] sm:text-[1.4rem] md:text-[1.6rem] text-[#2C3E50] mb-4`}
              >
                Legal & Privacy Information
              </h2>
            </div>

            {/* Decorative Elements */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-10 h-0.5 bg-[linear-gradient(90deg,transparent,#FF6B35,transparent)]" />
              <ShieldAlert className="w-8 h-8 text-[#FF6B35] drop-shadow-[2px_2px_4px_rgba(0,0,0,0.1)]" />
              <div className="w-10 h-0.5 bg-[linear-gradient(90deg,transparent,#FF6B35,transparent)]" />
            </div>

            <p
              className={`${semangatRegular.className} text-[#5A6C7D] text-base sm:text-lg max-w-[400px] mx-auto leading-relaxed`}
            >
              Your privacy matters to us, Emperor! 🛡️
              <br />
              Read how we protect your data in the digital realm.
            </p>
          </div>
          <hr className="mb-6 border-gray-200" />

          {/* Privacy Policy Section */}
          <div className="mb-8">
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-4">
              <ShieldCheck className="w-6 h-6" /> Privacy Policy
            </h3>
            <ul className="space-y-8">
              <li className="flex gap-4">
                <Info className="w-6 h-6 text-primary shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-black">Information Collection</h4>
                  <p className="text-[#555] mt-1">
                    We use cookies to gain stats like number of visits and
                    other common non-private info about our users.
                    <br />
                    In case of social authentication (e.g. connecting your
                    Google account) we only collect a unique numerical
                    identifier to identify you. We don’t save any private info
                    including your name, email, or profile image.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <Info className="w-6 h-6 text-primary shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-black">Information Sharing</h4>
                  <p className="text-[#555] mt-1">
                    We don’t share any information with any third party or any
                    entity.
                    <br />
                    We don’t collect much info at the first place anyway.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <ShieldCheck className="w-6 h-6 text-primary shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-black">Data Security</h4>
                  <p className="text-[#555] mt-1">
                    We use common security practices like 2FA, clusters,
                    role-based access, and etc.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <Gavel className="w-6 h-6 text-primary shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-black">Data Retention</h4>
                  <p className="text-[#555] mt-1">
                    We store user generated data and progress in our games in
                    variety of databases. including Redis and MongoDB.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <ShieldAlert className="w-6 h-6 text-primary shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-black">Children’s Privacy</h4>
                  <p className="text-[#555] mt-1">
                    We don’t have much of gruesome or harmful content on our
                    website or subdomains but to adhere to possible rules, we
                    only offer this website and subdomains to adults. Adults
                    in different countries may be considered in different
                    ages, but we consider it 18 and above to follow standards.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <Info className="w-6 h-6 text-primary shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-black">Changes to Privacy Policy</h4>
                  <p className="text-[#555] mt-1">
                    This Document may get updated later and we reserve the
                    right to add or remove new element to it.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <Mail className="w-6 h-6 text-primary shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-black">Contact Us</h4>
                  <p className="text-[#555] mt-1">
                    You can always reach us at our socials and emails:
                    <br />
                    contact@thelol.xyz
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <hr className="mb-6 border-gray-200" />

          {/* Terms of Service Section */}
          <div>
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-4">
              <Gavel className="w-6 h-6" /> Terms of Service
            </h3>
            <ul className="space-y-8">
              <li className="flex gap-4">
                <Info className="w-6 h-6 text-primary shrink-0 mt-1" />
                <div>
                  <p className="text-black font-semibold">
                    By using this website, you agree to this terms of service:
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <Gavel className="w-6 h-6 text-primary shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-black">Forbidden Activity</h4>
                  <p className="text-[#555] mt-1">
                    You agree to never promote hateful content towards a race,
                    nationality, religion, sexual orientation or any group of
                    people who cherish a certain belief or practice.
                    <br />
                    You agree to never use hateful or inappropriate names or
                    related data in your user profiles.
                    <br />
                    You agree to not spam, ddos or maliciously try to abuse
                    the website or other things around it.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tos;
