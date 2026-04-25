import Head from "next/head";

export default function Offline() {
  return (
    <div>
      <Head>
        <title>Offline</title>
      </Head>
      <h1>You are offline</h1>
      <p>Please check your internet connection and try again.</p>
    </div>
  );
}
