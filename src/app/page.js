"use client"
import { useSession, signIn, signOut } from "next-auth/react";
import Dashboard from "./dashboard";

export default function Home() {
  const { data: session } = useSession();
  if (session) return <Dashboard />;
  else return <button onClick={() => signIn()}>Sign in</button>;
}
