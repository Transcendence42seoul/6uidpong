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
  const [code, setCode] = useState("");

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleSetIsTwoFactorVerified = () => {
    // 이메일 보내는 POST 요청 처리
    axios
      .post("/api/v1/auth/isTwoFactor", { email })
      .then((response: AxiosResponse<boolean>) => {
        // 이메일이 성공적으로 보내진 경우, 인증코드 작성 창이 나타나도록 상태 변경
        setSendmail(true);
      })
      .catch((error: AxiosError) => {
        alert("이메일 잘못된듯");
      });
  };

  const handleVerifyVerificationCode = () => {
    // 인증코드를 서버로 보내는 POST 요청 처리
    axios
      .post("/api/v1/auth/verifyVerificationCode", {
        email,
        code,
      })
      .then((response: AxiosResponse<boolean>) => {
        // 인증코드가 올바른 경우, 추가 로직 처리
        alert("2차 인증 완료!");
      })
      .catch((error: AxiosError) => {
        alert("인증번호 틀렸음");
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
                    name="code"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
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
