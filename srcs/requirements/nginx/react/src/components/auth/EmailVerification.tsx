import React, { useEffect, useState } from "react";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import MockAdapter from "axios-mock-adapter";
import { SendEmailVerification, VerifyEmail } from "./SendEmailVerification"; // sendEmailVerification.ts에서 함수 import
import HoverButton from "../button/HoverButton";

const mock = new MockAdapter(axios);

const defaultData = [{ id: 1, email: "wocheon@42seoul.student.kr" }];

const EmailVerification: React.FC = () => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [twoFactorAuthEnabled, setTwoFactorAuthEnabled] = useState(false);

  useEffect(() => {
    // GET 요청으로 초기 데이터 가져오기.
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // AxiosInstance 객체 생성
      const axiosInstance = axios.create({
        baseURL: "/api", // 서버의 기본 URL
        headers: {
          "Content-Type": "application/json", // 요청 헤더의 Content-Type 설정
          // 기타 필요한 헤더 설정
        },
      });

      // AxiosInstance 객체에 기본 데이터 추가
      axiosInstance.defaults.headers.common = {
        "Content-Type": "application/json", // 기본 설정 값 지정
      };

      const defaultData = {
        email: "wocheon@student.42seoul.kr",
        name: "wocheon",
      };

      // 기타 필요한 헤더 설정
      // axiosInstance.defaults.headers.[headerName] = [headerValue];

      // 기본 데이터 설정

      //GET 요청 보내기
      const response = await axiosInstance.get("/api/email", {
        params: defaultData,
      });
      console.log(response.data.email);

      // email 추출해서 상태 업데이트.
      if (response && response.data && response.data.email) {
        setEmail(response.data.email);
      } else {
        // 에러 처리
        console.error("Error occurred during axios request:", response);
        // 에러 처리 로직 추가
      }
    } catch (error) {
      // 에러 처리
      console.error("Fail to set Email: error");
    }
  };

  const handleIsTwoFactorAuth = async () => {
    setTwoFactorAuthEnabled(true);
  };

  const isTwoFactorAuthEnabled = twoFactorAuthEnabled; // 사용자 설정에서 2단계 인증 활성화 여부 가져오기
  // 이메일 인증 요청 핸들러
  const handleSendVerification = async () => {
    if (isTwoFactorAuthEnabled) {
      // 2단계 인증 활성화 여부 체크
      await SendEmailVerification(email); // 이메일 인증 요청 함수 호출
      // 이메일 인증 요청 후 필요한 처리
    } else {
      // 2단계 인증이 비활성화된 경우에 대한 처리
    }
  };

  // 이메일 인증 검증 핸들러
  const handleVerifyEmail = async () => {
    if (isTwoFactorAuthEnabled) {
      // 2단계 인증 활성화 여부 체크
      const result = await VerifyEmail(email, verificationCode); // 이메일 인증 검증 함수 호출
      setIsVerified(result); // 검증 결과 설정
      // 이메일 인증 검증 후 필요한 처리
    } else {
      // 2단계 인증이 비활성화된 경우에 대한 처리
    }
  };

  return (
    <div>
      <button onClick={handleIsTwoFactorAuth}>2단계 인증</button>
      <div>
        {twoFactorAuthEnabled ? (
          <>
            <h2>입력된 email: {email}</h2>(
            <button onClick={handleSendVerification}>
              Send Email Verification
            </button>
            <button onClick={handleVerifyEmail}>Verify Email</button>)
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
          </>
        ) : (
          <></>
        )}
      </div>
      <div>
        {isVerified ? (
          <>
            (<p>Email is verified.</p>)
          </>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
