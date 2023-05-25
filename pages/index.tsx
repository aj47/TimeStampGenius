import { useSession, signIn, signOut } from "next-auth/react";
import Dashboard from "@/components/Dashboard";

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
          <h1 style={{ margin: 30 }}>Timestamp Genius (Beta)</h1>
          <button onClick={() => signIn()}>Sign in</button>
        </div>
      )}
    </>
  );
}
