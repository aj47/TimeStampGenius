import React, { useEffect, useState } from "react";
import Dashboard from "@/components/Dashboard";

const FreeTrial = (props) => {
  const [userId, setUserId] = useState("");
  useEffect(() => {
    const URLParams = new URLSearchParams(window.location.search);
    const user = URLParams.get("user");
    if (user.indexOf("@") === -1) setUserId(URLParams.get("user"));
  }, []);
  return (
    <div>{userId ? <Dashboard freeTrial={userId} /> : "User not valid"}</div>
  );
};

export default FreeTrial;
