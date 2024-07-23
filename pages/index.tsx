import Dashboard from "@/components/Dashboard";
import Head from "next/head";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";

export default function Home() {
  const [userId, setUserId] = useState<String | null>("");
  useEffect(() => {
    const URLParams = new URLSearchParams(window.location.search);
    const user = URLParams.get("user");
    console.log(user, "user");
    if (user?.indexOf("@") === -1) setUserId(URLParams.get("user"));
  }, []);
  return (
    <>
      <Head>
        <title>Timestamp Genius</title>
      </Head>
      <Dashboard />
      <Footer />
    </>
  );
}
