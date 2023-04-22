import React, { useState } from "react";
import axios from "axios";

const TwoFactorAuth = () => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isTwoFactorVerified, setIsTwoFactorVerified] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") {
      setEmail(value);
    } else if (name === "verificationCode") {
      setVerificationCode(value);
    }
  };

  const handleVerifyTwoFactorAuth = async () => {
    try {
      const response = await axios.post("/api/v1/users/true", { email });
      const { data } = response;
      if (data.isTwoFactor) {
        setIsTwoFactorVerified(true);
      }
    } catch (error) {
      console.error("Failed to verify two-factor authentication:", error);
    }
  };

  const handleVerifyVerificationCode = async () => {
    try {
      const response = await axios.post(
        "/api/v1/users/verifyVerificationCode",
        { email, code: verificationCode }
      );
      const { data } = response;
      if (data) {
        setIsTwoFactorVerified(true);
      }
    } catch (error) {
      console.error("Failed to verify verification code:", error);
    }
  };

  return (
    <div>
      {!isTwoFactorVerified ? (
        <>
          <h1>Verify Two-Factor Authentication</h1>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleInputChange}
            />
          </label>
          <button onClick={handleVerifyTwoFactorAuth}>Verify</button>
        </>
      ) : (
        <>
          <h1>Verification Code</h1>
          <label>
            Verification Code:
            <input
              type="text"
              name="verificationCode"
              value={verificationCode}
              onChange={handleInputChange}
            />
          </label>
          <button onClick={handleVerifyVerificationCode}>Submit</button>
        </>
      )}
    </div>
  );
};

export default TwoFactorAuth;
