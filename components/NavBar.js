import React, { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import tsgLogo from "@/public/tsg-logo-long.svg";
import Modal from "./Modal";
import Settings from "./Settings";
import { FaBars, FaTimes } from "react-icons/fa";
import { useGlobalStore } from "../store/GlobalStore";

const NavBar = () => {
  const { data: session, status } = useSession();
  const { credits, setCredits, chunkSize, setChunkSize, systemPrompt, setSystemPrompt } = useGlobalStore();
  const [buyCreditsModalOpen, setBuyCreditsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    signOut();
    setIsMenuOpen(false);
  };

  const openSettingsModal = () => {
    setIsSettingsModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleChunkSizeChange = (newSize) => {
    setChunkSize(newSize);
  };

  const handleSystemPromptChange = (newPrompt) => {
    setSystemPrompt(newPrompt);
  };

  const DropdownMenu = () => {
    if (!isMenuOpen) return null;

    return (
      <div className="dropdown-menu">
        <button onClick={openSettingsModal}>Settings</button>
        {status === "authenticated" ? (
          <>
            <button onClick={() => setBuyCreditsModalOpen(true)}>
              Buy Credits
            </button>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <button onClick={() => popupCenter("/google-signin", "Sample Sign In")}>
            Login with Google
          </button>
        )}
      </div>
    );
  };
  const buyCredits = async (itemId) => {
    const buyCredits = await fetch("/api/buyCredits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [{ id: itemId, quantity: 1 }],
      }),
    }).then((res) => res.json());
    if (buyCredits.url) window.location = buyCredits.url;
  };

  const BuyCreditOptions = () => {
    return (
      <div className="buy-credit-modal">
        <h1>Buy credits</h1>
        <button
          onClick={() => {
            buyCredits(1);
          }}
        >
          500 credits for $5
        </button>
        <button
          onClick={() => {
            buyCredits(2);
          }}
        >
          1000 credits for $9
        </button>
        <button
          onClick={() => {
            buyCredits(3);
          }}
        >
          3000 credits for $20
        </button>
      </div>
    );
  };

  const updateCredits = async () => {
    const response = await fetch("/api/getCredits", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
    setCredits(response.credits);
  };

  useEffect(() => {
    if (status === "authenticated") updateCredits();
  }, [status]);

  const popupCenter = (url, title) => {
    const dualScreenLeft = window.screenLeft ?? window.screenX;
    const dualScreenTop = window.screenTop ?? window.screenY;

    const width =
      window.innerWidth ?? document.documentElement.clientWidth ?? screen.width;

    const height =
      window.innerHeight ??
      document.documentElement.clientHeight ??
      screen.height;

    const systemZoom = width / window.screen.availWidth;

    const left = (width - 500) / 2 / systemZoom + dualScreenLeft;
    const top = (height - 550) / 2 / systemZoom + dualScreenTop;

    const newWindow = window.open(
      url,
      title,
      `width=${500 / systemZoom},height=${
        550 / systemZoom
      },top=${top},left=${left}`
    );

    newWindow?.focus();
  };

  return (
    <div className="navbar">
      <div
        className="menu-container"
        style={{ marginRight: "auto", marginLeft: 0 }}
      >
        <button
          className="menu-button"
          onClick={toggleMenu}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
        <DropdownMenu />
      </div>
      {status !== "authenticated" && (
        <button
          style={{ marginLeft: "auto", opacity: 0.5 }}
          onClick={() => popupCenter("/google-signin", "Sample Sign In")}
        >
          Login with Google
        </button>
      )}
      <Image
        height={40}
        style={{
          pointerEvents: "none",
          padding: 2,
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
        }}
        priority
        className="logo"
        src={tsgLogo}
        alt="Timestamp Genius"
      />
      <Modal
        isOpen={buyCreditsModalOpen}
        onClose={() => setBuyCreditsModalOpen(false)}
      >
        <BuyCreditOptions />
      </Modal>
      <Modal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      >
        <Settings 
          chunkSize={chunkSize} 
          onChunkSizeChange={handleChunkSizeChange}
          systemPrompt={systemPrompt}
          onSystemPromptChange={handleSystemPromptChange}
        />
      </Modal>
      {status === "authenticated" && (
        <div style={{ display: "flex", alignItems: "center" }}>
          <>
            {!buyCreditsModalOpen && (
              <button
                className="primary"
                onClick={() => {
                  if (freeTrial) return;
                  setBuyCreditsModalOpen(true);
                }}
              >
                Credits: {credits}
              </button>
            )}
          </>
        </div>
      )}
    </div>
  );
};

export default NavBar;