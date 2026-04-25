import React from "react";
import { useScreenSize } from "@/contexts/ScreenSizeContext";
import SmallScreenDescription from "./SmallScreenDescription";

interface SmallScreenWrapperProps {
  children: React.ReactNode;
}

const SmallScreenWrapper: React.FC<SmallScreenWrapperProps> = ({
  children,
}) => {
  const { isSmallScreen, isLoading } = useScreenSize();

  // Show loading state while detecting screen size
  if (isLoading) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-transparent text-white">
        <div>Loading...</div>
      </div>
    );
  }

  // Show small screen message for small screens
  if (isSmallScreen) {
    return <SmallScreenDescription />;
  }

  // Render children for large screens
  return <>{children}</>;
};

export default SmallScreenWrapper;
