import React, { useState, useEffect } from "react";
import HoverButton from "../button/HoverButton";
import axios, { AxiosInstance } from "axios";

function Nickname() {
  const [nickname, setNickname] = useState("");
  const [updatedNickname, setUpdatedNickname] = useState("");

  useEffect(() => {
    // GET 요청을 보내 초기 데이터를 가져옴
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // AxiosInstance 객체 생성
      const axiosInstance: AxiosInstance = axios.create({
        // AxiosInstance 객체의 설정 옵션들
      });

      // GET 요청 보내기
      const response = await axiosInstance.get("/api/nickname"); // mock db의 API 엔드포인트
      // 응답 데이터에서 닉네임 추출하여 상태 업데이트
      setNickname(response.data.nickname);
    } catch (error) {
      // 에러 처리
      console.error("Failed to fetch data:", error);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(event.target.value);
  };

  const handleClick = async () => {
    try {
      // AxiosInstance 객체 생성
      const axiosInstance: AxiosInstance = axios.create({
        // AxiosInstance 객체의 설정 옵션들
      });

      // POST 요청 보내기
      await axiosInstance.post("/api/nickname", { nickname }); // mock db의 API 엔드포인트와 데이터
      // 업데이트된 닉네임으로 상태 업데이트
      setUpdatedNickname(nickname);
    } catch (error) {
      // 에러 처리
      console.error("Failed to update data:", error);
    }
  };

  return (
    <div>
      <h2>닉네임 변경</h2>
      <input type="text" value={nickname} onChange={handleChange} />
      <HoverButton onClick={handleClick}>변경</HoverButton>
      <p>업데이트된 닉네임: {updatedNickname}</p>
    </div>
  );
}

export default Nickname;
