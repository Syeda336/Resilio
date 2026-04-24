import { useState, useEffect } from 'react';
import { X, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCw } from 'lucide-react';

interface ArrowPuzzleProps {
  onClose: () => void;
  onComplete: () => void;
}

type Direction = 'up' | 'down' | 'left' | 'right';

interface Cell {
  direction: Direction;
}

const GRID_SIZE = 6;

export function ArrowPuzzle({ onClose, onComplete }: ArrowPuzzleProps) {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [moves, setMoves] = useState(0);

  // Initialize grid with random arrows
  useEffect(() => {
    initializeGrid();
  }, []);

  const initializeGrid = () => {
    const directions: Direction[] = ['up', 'down', 'left', 'right'];
    const newGrid: Cell[][] = [];
    
    for (let i = 0; i < GRID_SIZE; i++) {
      const row: Cell[] = [];
      for (let j = 0; j < GRID_SIZE; j++) {
        const randomDirection = directions[Math.floor(Math.random() * directions.length)];
        row.push({ direction: randomDirection });
      }
      newGrid.push(row);
    }
    
    setGrid(newGrid);
    setMoves(0);
  };

  const rotateArrow = (rowIndex: number, colIndex: number) => {
    const newGrid = [...grid];
    const currentDirection = newGrid[rowIndex][colIndex].direction;
    
    // Rotate clockwise: up -> right -> down -> left -> up
    const rotationMap: Record<Direction, Direction> = {
      'up': 'right',
      'right': 'down',
      'down': 'left',
      'left': 'up'
    };
    
    newGrid[rowIndex][colIndex].direction = rotationMap[currentDirection];
    setGrid(newGrid);
    setMoves(moves + 1);
    
    // Check if all arrows are aligned
    checkWin(newGrid);
  };

  const checkWin = (currentGrid: Cell[][]) => {
    const firstDirection = currentGrid[0][0].direction;
    const allSame = currentGrid.every(row => 
      row.every(cell => cell.direction === firstDirection)
    );
    
    if (allSame) {
      setTimeout(() => {
        alert(`Congratulations! You aligned all arrows in ${moves + 1} moves! 🎉`);
        onComplete();
        onClose();
      }, 300);
    }
  };

  const getArrowIcon = (direction: Direction) => {
    switch (direction) {
      case 'up':
        return <ArrowUp className="w-8 h-8" />;
      case 'down':
        return <ArrowDown className="w-8 h-8" />;
      case 'left':
        return <ArrowLeft className="w-8 h-8" />;
      case 'right':
        return <ArrowRight className="w-8 h-8" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl p-6 md:p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-slate-900 mb-1 flex items-center gap-3">
              <RotateCw className="w-7 h-7 text-blue-600" />
              Arrow Puzzle
            </h2>
            <p className="text-slate-600 text-sm">Rotate arrows to align them all in the same direction</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-200 hover:bg-slate-300 transition-colors"
          >
            <X className="w-5 h-5 text-slate-700" />
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-6 px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2">
            <RotateCw className="w-5 h-5 text-blue-600" />
            <span className="text-slate-700 font-medium">Moves: {moves}</span>
          </div>
          <button
            onClick={initializeGrid}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
          >
            New Puzzle
          </button>
        </div>

        {/* Game Grid */}
        <div className="flex items-center justify-center mb-4">
          <div className="inline-grid gap-2" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
            {grid.map((row, rowIndex) => (
              row.map((cell, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => rotateArrow(rowIndex, colIndex)}
                  className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center bg-white border-2 border-slate-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 hover:scale-105 transition-all duration-200 shadow-sm active:scale-95"
                >
                  <div className="text-blue-600">
                    {getArrowIcon(cell.direction)}
                  </div>
                </button>
              ))
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <h3 className="text-slate-900 text-sm font-semibold mb-2">How to Play:</h3>
          <ul className="text-slate-600 text-sm space-y-1">
            <li>• Click any arrow to rotate it clockwise</li>
            <li>• Align all arrows in the same direction to win</li>
            <li>• Try to solve it in minimum moves!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
