import { useSession, signIn } from "next-auth/react";
import Dashboard from "@/components/Dashboard";
import Image from "next/image";
import tsgLogo from "@/public/tsg-logo-long.svg";
import screenshot from "@/public/screenshot2.png";
import Head from "next/head";

export default function Home() {
  const { data: session } = useSession();
  return (
    <>
      <Head>
        <title>Timestamp Genius</title>
      </Head>
      {/* {session ? (
        <p>Signed in as {session.user?.email} </p>
      ) : (
        <p>Sign in to view data</p>
      )} */}
      {session ? (
        <>
          <Dashboard />
        </>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <Image
            height={70}
            style={{
              margin: 25,
            }}
            priority
            src={tsgLogo}
            alt="Timestamp Genius"
          />
          <div className="hero-container">
            <Image src={screenshot} alt="screenshot" className="screenshot1" />
            <h1 className="hero-title">
              <span className="highlight">Youtube Timestamp Generation</span>{" "}
              with AI!
            </h1>
            {/* <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/ZqoVJv3LKGE"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          ></iframe> */}
          </div>
          <button
            style={{ marginTop: -80 }}
            className="primary"
            onClick={() => signIn()}
          >
            Try for FREE!
          </button>
        </div>
      )}
      <div className="footer"> Any questions? Email arash@appricot.io</div>
    </>
  );
}
