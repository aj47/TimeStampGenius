import React, { useEffect, useState } from "react";

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
      {buyCreditsModalOpen && <BuyCreditOptions />}
      <p style={{marginRight: 'auto', color: 'red'}}>FIRE SALE! Credits are now 10 times cheaper! (Limited time)</p>
      <div>Credits: {props.credits}</div>
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
              onClick={() => {
                setBuyCreditsModalOpen(true);
              }}
            >
              Buy Credits
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default NavBar;
