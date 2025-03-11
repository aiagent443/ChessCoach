'use client';

import { useState, useCallback, useEffect } from 'react';
import { Chess, Move } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import EngineAnalysis from './EngineAnalysis';

type BoardOrientation = 'white' | 'black';

export default function ChessBoard() {
  // Initialize the chess instance and state
  const [game, setGame] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [position, setPosition] = useState<string>('');
  const [evaluation, setEvaluation] = useState<string>('');
  const [showEngine, setShowEngine] = useState(false);
  const [boardOrientation, setBoardOrientation] = useState<BoardOrientation>('white');

  // Update position and evaluation when game changes
  useEffect(() => {
    setPosition(game.fen());
    evaluatePosition();
  }, [game]);

  // Basic position evaluation
  const evaluatePosition = () => {
    const pieces = {
      p: 1, n: 3, b: 3, r: 5, q: 9, k: 0,
      P: -1, N: -3, B: -3, R: -5, Q: -9, K: 0
    };
    
    let score = 0;
    const fen = game.fen().split(' ')[0];
    
    for (const char of fen) {
      if (char in pieces) {
        score += pieces[char as keyof typeof pieces];
      }
    }

    const absScore = Math.abs(score);
    const advantage = score > 0 ? 'Black' : score < 0 ? 'White' : 'Equal';
    setEvaluation(score === 0 ? 'Equal position' : `${advantage} is ahead by ${absScore} points`);
  };

  // Function to make a move
  const makeAMove = useCallback((move: any) => {
    const gameCopy = new Chess(game.fen());
    try {
      const result = gameCopy.move(move);
      if (result) {
        setGame(gameCopy);
        // Add move to history
        setMoveHistory(prev => [...prev, `${result.piece.toUpperCase()}${result.from}-${result.to}`]);
        return true;
      }
    } catch (error) {
      return false;
    }
    return false;
  }, [game]);

  // Function to handle piece drop
  const onDrop = (sourceSquare: string, targetSquare: string) => {
    const move = game.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
    if (move === null) return false;
    setGame(new Chess(game.fen()));
    return true;
  };

  // Function to reset the game
  const resetGame = () => {
    console.log('Reset button clicked');
    setGame(new Chess());
    setMoveHistory([]);
    setEvaluation('Equal position');
    console.log('Game reset:', game.fen());
  };

  // Function to undo last move
  const undoMove = () => {
    console.log('Undo button clicked');
    game.undo();
    setGame(new Chess(game.fen()));
    console.log('Move undone:', game.fen());
  };

  function flipBoard() {
    console.log('Flip board button clicked');
    setBoardOrientation(boardOrientation === 'white' ? 'black' : 'white');
    console.log('Board orientation:', boardOrientation);
  }

  function copyFEN() {
    console.log('Copy FEN button clicked');
    navigator.clipboard.writeText(game.fen());
    console.log('FEN copied:', game.fen());
  }

  return (
    <div className="flex flex-col md:flex-row md:space-x-4">
      <div className="flex-grow">
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          boardWidth={400}
          customBoardStyle={{ borderRadius: '4px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' }}
        />
        <div className="mt-4 flex justify-between">
          <button onClick={resetGame} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Reset</button>
          <button onClick={undoMove} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Undo</button>
          <button onClick={() => setShowEngine(!showEngine)} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            {showEngine ? 'Hide Engine' : 'Show Engine'}
          </button>
        </div>
      </div>
      {showEngine && (
        <div className="mt-4 md:mt-0 md:w-1/3">
          <EngineAnalysis fen={game.fen()} />
        </div>
      )}
    </div>
  );
} 