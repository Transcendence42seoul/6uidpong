import React from "react";
import { useNavigate } from "react-router-dom";
import { Socket } from "socket.io-client";

interface UserGameRoomState {
  paddle1: number;
  paddle2: number;
  ballx: number;
  bally: number;
  score1: number;
  score2: number;
}

interface GameStartProps {
  socket: Socket;
}

const GameStart: React.FC<GameStartProps> = ({ socket }) => {
  const navigate = useNavigate();

  socket.on('game-state', (roomState: UserGameRoomState) => {

  });
  return (
    <div>
      <canvas></canvas>
    </div>
  );
};

export default GameStart;
