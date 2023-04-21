import React, { useState } from "react";

// sendEmailVerification.ts
const SendEmailVerification = async (email: string): Promise<void> => {
  // 이메일 인증 코드를 서버로 전송하는 비동기 함수 구현
  // 예: API 요청 등을 통한 이메일 인증 코드 전송
};

const VerifyEmail = async (
  email: string,
  verificationCode: string
): Promise<boolean> => {
  // 이메일 인증 코드를 서버로 전송하여 검증하는 비동기 함수 구현
  // 예: API 요청 등을 통한 이메일 인증 검증
  // 검증 결과를 boolean 값으로 반환
  return true;
};

export { SendEmailVerification, VerifyEmail };
