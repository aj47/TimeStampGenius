import Dashboard from "@/components/Dashboard";
import Head from "next/head";
import Footer from "@/components/Footer";

export default function Home() {
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