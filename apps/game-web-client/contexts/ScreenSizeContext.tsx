import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface ScreenSizeContextType {
  isSmallScreen: boolean;
  isLoading: boolean;
  width: number;
  height: number;
}

const ScreenSizeContext = createContext<ScreenSizeContextType | undefined>(
  undefined
);

export const useScreenSize = (): ScreenSizeContextType => {
  const context = useContext(ScreenSizeContext);
  if (context === undefined) {
    throw new Error("useScreenSize must be used within a ScreenSizeProvider");
  }
  return context;
};

export const ScreenSizeProvider = ({ children }: { children: ReactNode }) => {
  const [screenSize, setScreenSize] = useState<{
    width: number;
    height: number;
    isSmallScreen: boolean;
    isLoading: boolean;
  }>({
    width: 0,
    height: 0,
    isSmallScreen: false,
    isLoading: true,
  });

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isSmallScreen = width < 960; // Match Material-UI's md breakpoint

      setScreenSize({
        width,
        height,
        isSmallScreen,
        isLoading: false,
      });
    };

    // Set initial screen size
    updateScreenSize();

    // Add event listener for window resize
    window.addEventListener("resize", updateScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

  return (
    <ScreenSizeContext.Provider value={screenSize}>
      {children}
    </ScreenSizeContext.Provider>
  );
};
