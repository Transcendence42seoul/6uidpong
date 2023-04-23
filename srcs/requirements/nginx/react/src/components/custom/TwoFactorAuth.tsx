import React, { useState } from "react";
import axios, { AxiosResponse, AxiosError } from "axios";
import HoverButton from "../button/HoverButton";
import Modal from "../modal/Modal";

interface UserEntity {
  id: number;
  nickname: string;
  email: string;
  profileImage: string;
  isTwoFactor: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
}

const TwoFactorAuth = () => {
  const [openModal, setOpenModal] = useState(false);
  const [email, setEmail] = useState("");
  const [sendmail, setSendmail] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isTwoFactorVerified, setIsTwoFactorVerified] = useState(false);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleSetIsTwoFactorVerified = () => {
    // 이메일 보내는 POST 요청 처리
    axios
      .post("/api/v1/auth/isTwoFactor", { email, isTwoFactorVerified })
      .then((response: AxiosResponse<UserEntity>) => {
        // 이메일이 성공적으로 보내진 경우, 인증코드 작성 창이 나타나도록 상태 변경
        const userData: UserEntity = response.data;
        setSendmail(true);
      })
      .catch((error: AxiosError) => {
        // 이메일 보내기 실패 시, 에러 처리
        console.error("Failed to send email:", error);
      });
  };

  const handleVerifyVerificationCode = () => {
    // 인증코드를 서버로 보내는 POST 요청 처리
    axios
      .post("/api/v1/auth/verifyVerificationCode", {
        email,
        verificationCode,
      })
      .then((response: AxiosResponse<UserEntity>) => {
        // 인증코드가 올바른 경우, 추가 로직 처리
        const userData: UserEntity = response.data;
        alert("2차 인증 완료!");
      })
      .catch((error: AxiosError) => {
        // 인증코드가 올바르지 않은 경우, 에러 처리
        console.error("Failed to verify verification code:", error);
      });
  };

  return (
    <div>
      <HoverButton onClick={handleOpenModal}>인증 활성화</HoverButton>
      <Modal isOpen={openModal} onClose={handleCloseModal}>
        <div className="h-screen">
          {openModal ? (
            <>
              <h1>Verify Two-Factor Authentication</h1>
              <p>
                Please enter your email address to receive a verification code.
              </p>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                style={{ color: "black" }}
              />
              <button onClick={handleSetIsTwoFactorVerified}>Verify</button>
              {sendmail && (
                <>
                  <h1>Verification Code</h1>
                  <input
                    type="text"
                    name="verificationCode"
                    value={verificationCode}
                    onChange={(event) =>
                      setVerificationCode(event.target.value)
                    }
                    style={{ color: "black" }}
                  />
                  <button onClick={handleVerifyVerificationCode}>Submit</button>
                </>
              )}
            </>
          ) : (
            <></>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default TwoFactorAuth;
