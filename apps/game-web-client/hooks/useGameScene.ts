import { useEffect, useRef, useState } from "react";
import { ZoneInfo } from "../lib/types";
import { speakTextDirect } from "../lib/audio";
import { useGameStore } from "../stores/gameStore";

/**
 * Custom hook for managing main scene state, event handlers, and game logic
 */
export const useGameScene = () => {
  // Interactive Zone Trigger States
  const [activeZone, setActiveZone] = useState<ZoneInfo | null>(null);
  const [openZoneId, setOpenZoneId] = useState<string | null>(null);
  const [spokenZones, setSpokenZones] = useState<Record<string, boolean>>({});

  // Room Specific States
  // Vault Cooldown
  const [vaultCooldown, setVaultCooldown] = useState(0);
  const [vaultClaimed, setVaultClaimed] = useState(false);

  // Council Chambers Vote Simulation
  const [proposedOrdinance, setProposedOrdinance] = useState<string | null>(
    null,
  );
  const [voteStage, setVoteStage] = useState<"idle" | "voting" | "finished">(
    "idle",
  );
  const [yesVotes, setYesVotes] = useState(0);
  const [noVotes, setNoVotes] = useState(0);
  const [voteLogs, setVoteLogs] = useState<string[]>([]);
  const voteIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Archives Page Reader
  const [archivePage, setArchivePage] = useState(0);

  // Zustand Store variables
  const { heal, addCoins, setScoreMultiplier, coins } = useGameStore();

  // 1. Detect key E to open zone interaction
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyE" && activeZone) {
        setOpenZoneId(activeZone.id);
        // Play TTS narration automatically when opening dashboard
        speakTextDirect(activeZone.speechText);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeZone]);

  // 2. Cooldown timer for vault claim
  useEffect(() => {
    if (vaultCooldown > 0) {
      const timer = setTimeout(() => setVaultCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [vaultCooldown]);

  // 3. Cleanup vote interval on unmount
  useEffect(() => {
    return () => {
      if (voteIntervalRef.current) clearInterval(voteIntervalRef.current);
    };
  }, []);

  // 4. Audio Guide announcer logic (Automatic speech once per zone per session)
  const handleEnterZone = (zone: ZoneInfo) => {
    setActiveZone(zone);
    if (!spokenZones[zone.id]) {
      speakTextDirect(`Arriving at: ${zone.title}. ${zone.description}`);
      setSpokenZones((prev) => ({ ...prev, [zone.id]: true }));
    }
  };

  const handleExitZone = (id: string) => {
    setActiveZone((current) => (current?.id === id ? null : current));
  };

  // Council chamber simulated vote logic
  const handleProposeOrdinance = (name: string) => {
    if (voteStage === "voting") return;

    setProposedOrdinance(name);
    setVoteStage("voting");
    setYesVotes(0);
    setNoVotes(0);
    setVoteLogs([
      "Ordinance introduced on the assembly floor...",
      "Speaker: Debate is now open.",
    ]);

    speakTextDirect(
      `Proposing city ordinance: ${name}. Assembly is now voting.`,
    );

    let count = 0;
    const logs = [
      "Councilor Aaron: This represents severe progress for our monorepo!",
      "Councilor Beatrice: The visual aesthetics are outstanding, I approve.",
      "Councilor Cedric: Will this cause performance regressions in the frame rates?",
      "Councilor Delilah: Our treasury has sufficient funding, let us build it.",
      "Councilor Eugene: Monorepos are the foundation of modern digital states!",
      "Councilor Fiona: Friction settings look highly tuned, yes!",
      "Councilor Gregory: I must register a minor objection regarding the colors.",
    ];

    if (voteIntervalRef.current) clearInterval(voteIntervalRef.current);

    voteIntervalRef.current = setInterval(() => {
      count++;
      setYesVotes((y) => y + Math.floor(Math.random() * 15) + 8);
      setNoVotes((n) => n + Math.floor(Math.random() * 8) + 2);

      if (count <= logs.length) {
        setVoteLogs((prev) => [...prev, logs[count - 1]]);
      }

      if (count >= 5) {
        if (voteIntervalRef.current) clearInterval(voteIntervalRef.current);
        setVoteStage("finished");

        // Resolve final vote
        setYesVotes((prevYes) => {
          setNoVotes((prevNo) => {
            const passed = prevYes > prevNo;
            if (passed) {
              addCoins(25);
              speakTextDirect(
                `Ordinance passed with ${prevYes} votes! The treasury has rewarded you 25 gold.`,
              );
              setVoteLogs((p) => [
                ...p,
                "🏆 ORDINANCE PASSED! 25 Coins distributed to proposer.",
              ]);
            } else {
              speakTextDirect("Ordinance rejected by the council.");
              setVoteLogs((p) => [
                ...p,
                "❌ ORDINANCE REJECTED. Proposer failed to secure majority.",
              ]);
            }
            return prevNo;
          });
          return prevYes;
        });
      }
    }, 900);
  };

  // Archive pages definitions
  const archivePages = [
    {
      title: "Volume I: The Monorepo Genesis",
      content:
        "Before the great convergence, developers roamed in separate repositories, lost in dependency conflicts. Then came the great Monorepo structure, uniting the Next.js Game Client and the PostgreSQL Game Server under a single package manager. Standardized linting and shared assets bound the kingdoms together, achieving absolute builds and unified exports.",
    },
    {
      title: "Volume II: The Riddle of Rapier",
      content:
        "Physics was but a dream until the Rapier engine was forged. The floating capsule controllers, once sliding aimlessly in frictionless vacuum, were given mass, friction, and gravity. Ground meshes were given solid colliders and precise friction coefficients, enabling players to sprint, jump, and interact with the physical objects of the realm.",
    },
    {
      title: "Volume III: The Statue Prophecy",
      content:
        "Legend tells of a magnificent monument that will stand in the center of the City Hall. Though today only a glowing holographic energy matrix floats upon the pedestal, the ancient developer scrolls foretell of an engineer who will write a Statue schema into the database, model a gorgeous polygon structure, and materialize the monument for all to witness.",
    },
  ];

  return {
    // States
    activeZone,
    setActiveZone,
    openZoneId,
    setOpenZoneId,
    spokenZones,
    setSpokenZones,
    vaultCooldown,
    setVaultCooldown,
    vaultClaimed,
    setVaultClaimed,
    proposedOrdinance,
    setProposedOrdinance,
    voteStage,
    setVoteStage,
    yesVotes,
    setYesVotes,
    noVotes,
    setNoVotes,
    voteLogs,
    setVoteLogs,
    archivePage,
    setArchivePage,
    archivePages,
    coins,
    // Handlers
    handleEnterZone,
    handleExitZone,
    handleProposeOrdinance,
    // Store actions
    heal,
    addCoins,
    setScoreMultiplier,
  };
};
