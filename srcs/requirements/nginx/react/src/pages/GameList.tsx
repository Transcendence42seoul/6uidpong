import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import HoverButton from '../components/button/HoverButton';
import ListContainer from '../components/container/ListContainer';
import ListTitle from '../components/container/ListTitle';
import ImageSrc from '../constants/ImageSrc';

import { isTest, mockGames } from '../mock'; // test
import PasswordModal from '../components/modal/PasswordModal';

interface Game {
  id: number;
  title: string;
  isLocked: boolean;
}

const GameList: React.FC = () => {
  const navigate = useNavigate();

  const [games, setGames] = useState<Game[]>(isTest ? mockGames : []); // test
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);

  const joinGame = () => {
    if (!selectedGame) return;
    const { id, isLocked } = selectedGame;
    if (!showPasswordModal && isLocked) {
      setShowPasswordModal(true);
      return;
    }
    navigate(`/custom/${id}`);
  };

  const handleCreateClick = () => {};

  const handleGameClick = (game: Game) => {
    setSelectedGame(game);
  };

  const handleGameDoubleClick = () => {
    joinGame();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!selectedGame) return;
    const { key } = event;
    if (key === 'ArrowUp' || key === 'ArrowDown') {
      event.preventDefault();
      if (showPasswordModal) return;
      const lastIndex = searchResults.length - 1;
      const currentIndex = searchResults.findIndex(
        (game) => game.id === selectedGame.id,
      );
      let nextIndex = currentIndex;
      if (key === 'ArrowUp') {
        nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
      } else if (key === 'ArrowDown') {
        nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
      }
      setSelectedGame(searchResults[nextIndex]);
    }
  };

  const handleSearchClick = () => {
    const results = games.filter((game) => {
      return game.title.toLowerCase().includes(searchTerm.toLowerCase());
    });
    setSearchResults([...results]);
  };

  const handleSearchTermChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSearchTerm(event.target.value);
  };

  const onConfirmClick = () => {
    joinGame();
  };

  useEffect(() => {
    setSearchResults(games);
  }, []);

  return (
    <ListContainer className="mt-12 px-20">
      <div className="flex-col items-center">
        <ListTitle className="mb-2.5 ml-2">Custom Games</ListTitle>
        <div className="flex">
          <input
            className="w-full border bg-black p-2 text-white focus:outline-none"
            type="text"
            placeholder="Search games"
            value={searchTerm}
            onChange={handleSearchTermChange}
          />
          <HoverButton className="border p-2" onClick={handleSearchClick}>
            Search
          </HoverButton>
          <HoverButton className="border p-2" onClick={handleCreateClick}>
            Create
          </HoverButton>
        </div>
      </div>
      {searchResults.map((game) => {
        const { id, title, isLocked } = game;
        return (
          <li key={id}>
            <button
              className={`flex w-full items-center space-x-1 border p-1 text-lg text-gray-100 ${
                id === selectedGame?.id ? 'bg-indigo-600' : ''
              }`}
              onClick={() => handleGameClick(game)}
              onDoubleClick={handleGameDoubleClick}
              onKeyDown={handleKeyDown}
            >
              <span>{title}</span>
              {isLocked && (
                <img src={ImageSrc.LOCK} alt="LOCK" className="h-5 w-5" />
              )}
            </button>
          </li>
        );
      })}
      {selectedGame && showPasswordModal && (
        <PasswordModal
          onConfirmClick={onConfirmClick}
          setShowModal={setShowPasswordModal}
        />
      )}
    </ListContainer>
  );
};

export default GameList;
