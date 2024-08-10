import Dashboard from "@/components/Dashboard";
import Head from "next/head";
import Footer from "@/components/Footer";
import { useEffect } from "react";
import { useGlobalStore } from "../store/GlobalStore";

export default function Home() {
  const { setFreeTrial } = useGlobalStore();

  useEffect(() => {
    const URLParams = new URLSearchParams(window.location.search);
    const user = URLParams.get("user");
    if (user?.indexOf("@") === -1) setFreeTrial(user);
  }, [setFreeTrial]);

  return (
    <>
      <Head>
        <title>Timestamp Genius</title>
      </Head>
      {/* <Dashboard /> */}
      <Footer />
    </>
  );
}