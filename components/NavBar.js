import React, { useState } from "react";

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
            50 credits for $5
          </button>
          <button
            onClick={() => {
              buyCredits(2);
            }}
          >
            100 credits for $9
          </button>
          <button
            onClick={() => {
              buyCredits(3);
            }}
          >
            300 credits for $20
          </button>
        </div>
      </div>
    );
  };
  return (
    <div className="navbar">
      {buyCreditsModalOpen && <BuyCreditOptions />}
      <div>Credits: 10</div>

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
          onClick={() => {
            setBuyCreditsModalOpen(true);
          }}
        >
          Buy Credits
        </button>
      )}
    </div>
  );
};

export default NavBar;
