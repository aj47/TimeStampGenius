import { useSession, signIn, signOut } from "next-auth/react";
import Dashboard from "@/components/Dashboard";
import Image from "next/image";
import tsgLogo from "@/public/tsg-logo-long.svg";

export default function Home() {
  const { data: session } = useSession();
  return (
    <>
      <title>Timestamp Genius</title>
      {/* {session ? (
        <p>Signed in as {session.user?.email} </p>
      ) : (
        <p>Sign in to view data</p>
      )} */}
      {session ? (
        <>
          <Dashboard />
          <button onClick={() => signOut()}>Sign out</button>
        </>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Image
            height={70}
            style={{
              margin: 25,
              marginBottom: 50
            }}
            priority
            src={tsgLogo}
            alt="Timestamp Genius"
          />
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/ZqoVJv3LKGE"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          ></iframe>
          <button
            style={{ marginTop: 50 }}
            className="primary"
            onClick={() => signIn()}
          >
            Try for FREE!
          </button>
        </div>
      )}
    </>
  );
}
