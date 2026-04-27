import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Client, Room } from "colyseus.js";
// import type { MyRoomState } from "../../../backend/src/rooms/MyRoom";

interface ColyseusNetworkContextType {
  ColyseusNetwork: {
    client: Client;
    room: Room | null;
  };
}

export const ColyseusNetworkContext = createContext<ColyseusNetworkContextType>(
  {
    ColyseusNetwork: {
      client: new Client(),
      room: null!,
    },
  },
);

export function useColyseusNetwork() {
  return useContext(ColyseusNetworkContext);
}

export function ColyseusNetworkProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const ColyseusNetwork = useMemo(() => {
    // detect if we're running on localhost
    const endpoint =
      process.env.NEXT_PUBLIC_ENVIRONMENT === "development"
        ? "http://localhost:2567"
        : "https://api.thelol.xyz";

    return {
      client: new Client(endpoint),
      room: null as Room | null,
    };
  }, []);

  return (
    <ColyseusNetworkContext.Provider value={{ ColyseusNetwork }}>
      {children}
    </ColyseusNetworkContext.Provider>
  );
}
