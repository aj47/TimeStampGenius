import React, { useEffect, useState } from "react";
import { signIn, signOut } from "next-auth/react";
import Image from "next/image";
import tsgLogo from "@/public/tsg-logo-long.svg";
import Modal from "./Modal";
import { FaBars, FaTimes } from "react-icons/fa";

const NavBar = (props) => {
  const [buyCreditsModalOpen, setBuyCreditsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    signOut();
    setIsMenuOpen(false);
  };

  const DropdownMenu = () => {
    if (!isMenuOpen) return null;

    return (
      <div className="dropdown-menu">
        <button onClick={handleLogout}>Logout</button>
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
        <div>
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
      </div>
    );
  };

  const updateCredits = async () => {
    let response = null;
    if (props.freeTrial) {
      response = await fetch("/api/getFreeCredits", {
        method: "POST",
        body: JSON.stringify({
          user: props.freeTrial,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .catch((e) => {
          document.location.href = "/";
        });
    } else {
      response = await fetch("/api/getCredits", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json());
    }
    props.setCredits(response.credits);
  };

  useEffect(() => {
    if (props.status === "authenticated") updateCredits();
  }, [props.status]);

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
      <div className="menu-container" style={{ marginRight: "auto", marginLeft: 0 }}>
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
      {props.status !== "authenticated" && (
        <button
          style={{ marginRight: "auto", opacity: 0.5, marginLeft: 10 }}
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
        <div className="buy-credit-modal">
          <h1>Buy credits</h1>
          <div>
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
        </div>
      </Modal>
      {props.status === "authenticated" && (
        <div style={{ display: "flex", alignItems: "center" }}>
          <>
            {!buyCreditsModalOpen && (
              <button
                className="primary"
                onClick={() => {
                  if (props.freeTrial) return;
                  setBuyCreditsModalOpen(true);
                }}
              >
                Credits: {props.credits}
              </button>
            )}
          </>
        </div>
      )}
    </div>
  );
};

export default NavBar;