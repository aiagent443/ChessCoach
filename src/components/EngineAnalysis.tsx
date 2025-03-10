'use client';

import { useEffect, useState, useRef } from 'react';
import { Chess } from 'chess.js';

interface EngineAnalysisProps {
  fen: string;
  depth?: number;
}

interface EngineMove {
  move: string;
  score: number;
  variation: string;
}

export default function EngineAnalysis({ fen, depth = 15 }: EngineAnalysisProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [bestMoves, setBestMoves] = useState<EngineMove[]>([]);
  const [engineLoaded, setEngineLoaded] = useState(false);
  const [engineError, setEngineError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Initialize Stockfish
    if (typeof window !== 'undefined' && !workerRef.current) {
      try {
        console.log('Initializing Stockfish...'); // Debug log
        const worker = new Worker('/stockfish.js');
        console.log('Worker created'); // Debug log
        workerRef.current = worker;

        worker.onmessage = (e) => {
          const message = e.data;
          console.log('Stockfish message:', message); // Debug logging
          
          if (typeof message === 'string') {
            if (message.includes('uciok')) {
              console.log('Engine initialized successfully'); // Debug logging
              setEngineLoaded(true);
              setEngineError(null);
            }
            // Parse Stockfish output
            if (message.startsWith('info depth')) {
              console.log('Received analysis:', message); // Debug logging
              const matches = message.match(/depth (\d+) .*score cp (-?\d+).*pv ([a-h][1-8][a-h][1-8].*)/);
              if (matches) {
                const [, moveDepth, score, variation] = matches;
                if (parseInt(moveDepth) === depth) {
                  const moves = variation.split(' ');
                  setBestMoves(prev => {
                    const newMove = {
                      move: moves[0],
                      score: parseInt(score) / 100, // Convert centipawns to pawns
                      variation: moves.slice(0, 3).join(' ')
                    };
                    
                    // Keep only top 3 moves
                    const existing = prev.filter(m => m.move !== newMove.move);
                    return [...existing, newMove]
                      .sort((a, b) => Math.abs(b.score) - Math.abs(a.score))
                      .slice(0, 3);
                  });
                }
              }
            }
          }
        };

        worker.onerror = (error) => {
          console.error('Stockfish worker error:', error);
          setEngineError(error.message);
        };

        // Configure Stockfish
        console.log('Sending UCI command...'); // Debug log
        worker.postMessage('uci');
        worker.postMessage('setoption name MultiPV value 3'); // Show top 3 moves
        
        return () => {
          worker.terminate();
          workerRef.current = null;
        };
      } catch (error) {
        console.error('Error initializing Stockfish:', error);
        setEngineError(error instanceof Error ? error.message : 'Unknown error');
      }
    }
  }, []);

  useEffect(() => {
    if (!workerRef.current || !fen || !engineLoaded) return;

    try {
      console.log('Starting analysis for position:', fen); // Debug log
      setAnalyzing(true);
      setBestMoves([]);

      const worker = workerRef.current;
      worker.postMessage('ucinewgame');
      worker.postMessage(`position fen ${fen}`);
      worker.postMessage(`go depth ${depth}`);

      // Stop analysis after 2 seconds
      const timeout = setTimeout(() => {
        worker.postMessage('stop');
        setAnalyzing(false);
      }, 2000);

      return () => clearTimeout(timeout);
    } catch (error) {
      console.error('Error during analysis:', error);
      setAnalyzing(false);
    }
  }, [fen, depth, engineLoaded]);

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Stockfish Analysis</h3>
      {engineError ? (
        <div className="text-red-600">Error loading engine: {engineError}</div>
      ) : !engineLoaded ? (
        <div className="text-gray-600">Loading Stockfish engine... Please check console for progress.</div>
      ) : analyzing ? (
        <div className="text-gray-600">Analyzing position...</div>
      ) : (
        <div className="space-y-2">
          {bestMoves.map((move, index) => (
            <div key={index} className="p-2 bg-white rounded shadow-sm">
              <div className="font-medium">
                Move {index + 1}: {formatMove(move.move)}
              </div>
              <div className="text-sm text-gray-600">
                Evaluation: {formatScore(move.score)}
              </div>
              <div className="text-sm text-gray-500">
                Variation: {move.variation.split(' ').map(formatMove).join(' ')}
              </div>
            </div>
          ))}
          {bestMoves.length === 0 && !analyzing && (
            <div className="text-gray-600">No analysis available yet. Make a move to start analysis.</div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper function to format moves in a readable way
function formatMove(move: string): string {
  if (move.length < 4) return move;
  return `${move.slice(0, 2)}→${move.slice(2, 4)}`;
}

// Helper function to format the evaluation score
function formatScore(score: number): string {
  if (score === 0) return "Equal (0.0)";
  const sign = score > 0 ? "+" : "";
  return `${sign}${score.toFixed(1)}`;
} 