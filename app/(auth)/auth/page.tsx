"use client";

import AuthTabs from "@/components/auth/AuthTabs";
import React from "react";

const AuthPage = () => {
  const redirectURL = localStorage.getItem("redirectAfterLogin");
  console.log("[/auth PAGE]: LOCAL STORAGE URL", redirectURL);
  return (
    <>
      <AuthTabs />
    </>
  );
};

export default AuthPage;
