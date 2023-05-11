import { useSession, signIn, signOut } from "next-auth/react";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const { data: session } = useSession();
  return (
    <>
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
        <button onClick={() => signIn()}>Sign in</button>
      )}
    </>
  );
}
