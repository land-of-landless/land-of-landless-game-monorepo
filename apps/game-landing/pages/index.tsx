import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Land of Landless - Welcome</title>
      </Head>

      {/* Ambient background with dynamic color glow circles */}
      <div className="ambient-bg" />

      {/* Main glassmorphic wrapper */}
      <div className="opener-wrapper">
        <main className="opener-card">
          {/* Glowing Animated Logo / Icon Placeholder */}
          <div className="logo-placeholder">
            <svg 
              width="36" 
              height="36" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#030303" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>

          <h1 className="title">Land of Landless</h1>
          <p className="subtitle">Official Game Portal</p>

          {/* Clean blank opener placeholder area for the user to fill */}
          <div className="slate-placeholder">
            <p className="slate-text">
              [ BLANK OPENER STATE ]
            </p>
            <p className="slate-text" style={{ fontSize: "0.75rem", marginTop: "0.5rem", opacity: 0.7 }}>
              This container is configured with pure glassmorphic CSS and is ready to be filled with your game loading, intro text, news, or components.
            </p>
          </div>

          <button 
            type="button" 
            className="cta-button"
            onClick={() => alert("Welcome to Land of Landless!")}
          >
            Enter Game
          </button>
        </main>
      </div>
    </>
  );
}
