import React, { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import tsgLogo from "@/public/tsg-logo-long.svg";

const NavBar = (props) => {
  const [buyCreditsModalOpen, setBuyCreditsModalOpen] = useState(false);
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
      }).then((res) => res.json());
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
    updateCredits();
  }, []);

  return (
    <div className="navbar">
      <button
        style={{ marginRight: "auto", opacity: 0.5, marginLeft: 0 }}
        onClick={() => signOut()}
      >
        Sign out
      </button>
      <Image
        height={40}
        style={{
          pointerEvents: "none",
          padding: 2,
          position: "absolute",
          left: '50%',
          transform: 'translateX(-50%)'
        }}
        priority
        src={tsgLogo}
        alt="Timestamp Genius"
      />
      {buyCreditsModalOpen && <BuyCreditOptions />}
      <div style={{ display: "flex", alignItems: "center" }}>
        {!props.freeTrial && (
          <>
            {buyCreditsModalOpen ? (
              <button
                onClick={() => {
                  setBuyCreditsModalOpen(false);
                }}
              >
                X
              </button>
            ) : (
              <button
                className="primary"
                onClick={() => {
                  setBuyCreditsModalOpen(true);
                }}
              >
                Credits: {props.credits}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NavBar;
