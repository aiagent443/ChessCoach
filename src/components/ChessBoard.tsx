'use client';

import { useState, useCallback, useEffect } from 'react';
import { Chess, Move } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import EngineAnalysis from './EngineAnalysis';

export default function ChessBoard() {
  // Initialize the chess instance and state
  const [game, setGame] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [position, setPosition] = useState<string>('');
  const [evaluation, setEvaluation] = useState<string>('');
  const [showEngine, setShowEngine] = useState(false);

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
    try {
      const result = game.move(move);
      if (result) {
        const newGame = new Chess(game.fen());
        setGame(newGame);
        // Add move to history
        setMoveHistory(prev => [...prev, `${result.piece.toUpperCase()}${result.from}-${result.to}`]);
      }
      return result;
    } catch (e) {
      return null;
    }
  }, [game]);

  // Function to handle piece drop
  function onDrop(sourceSquare: string, targetSquare: string) {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // always promote to queen for simplicity
    });

    if (move === null) return false;
    return true;
  }

  // Function to reset the game
  const resetGame = () => {
    setGame(new Chess());
    setMoveHistory([]);
    setEvaluation('Equal position');
  };

  // Function to undo last move
  const undoLastMove = () => {
    const newGame = new Chess(game.fen());
    newGame.undo();
    setGame(newGame);
    setMoveHistory(prev => prev.slice(0, -1));
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full max-w-[1200px] mx-auto">
      <div className="flex-1">
        <Chessboard 
          position={position} 
          onPieceDrop={onDrop}
          boardWidth={600}
          customBoardStyle={{
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
          }}
        />
        <div className="mt-4 flex justify-center gap-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            onClick={resetGame}
          >
            Reset Board
          </button>
          <button
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            onClick={undoLastMove}
            disabled={moveHistory.length === 0}
          >
            Undo Move
          </button>
          <button
            className={`px-4 py-2 rounded transition-colors ${
              showEngine 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
            onClick={() => setShowEngine(!showEngine)}
          >
            {showEngine ? 'Hide Engine' : 'Show Engine'}
          </button>
        </div>
      </div>
      
      <div className="flex-none w-full md:w-80 space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg shadow">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Position Evaluation</h3>
            <p className="text-gray-700">{evaluation}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Move History</h3>
            <div className="h-[200px] overflow-y-auto">
              {moveHistory.map((move, index) => (
                <div key={index} className="py-1 px-2 hover:bg-gray-100">
                  {`${index + 1}. ${move}`}
                </div>
              ))}
            </div>
          </div>
        </div>

        {showEngine && (
          <div className="p-4 bg-gray-50 rounded-lg shadow">
            <EngineAnalysis fen={position} />
          </div>
        )}
      </div>
    </div>
  );
} 