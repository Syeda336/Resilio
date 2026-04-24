import { X } from 'lucide-react';

const colors = [
  '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
  '#800000', '#008000', '#000080', '#808000', '#800080', '#008080', '#C0C0C0',
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE',
  '#85C1E2', '#F8B739', '#52B788', '#E74C3C', '#3498DB', '#2ECC71', '#F39C12',
  '#9B59B6', '#1ABC9C', '#E67E22', '#34495E', '#95A5A6', '#D35400', '#C0392B',
  '#8E44AD', '#2980B9', '#27AE60', '#16A085', '#F1C40F', '#E74292', '#5DADE2'
];

interface ColorPickerProps {
  currentColor: string;
  onSelect: (color: string) => void;
  onClose: () => void;
}

export function ColorPicker({ currentColor, onSelect, onClose }: ColorPickerProps) {
  return (
    <div className="bg-white border-2 border-gray-300 p-4 shadow-lg w-80">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-black">Select Text Color</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-black" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onSelect(color)}
            className={`w-8 h-8 border-2 transition-all hover:scale-110 ${
              currentColor === color ? 'border-emerald-600 ring-2 ring-emerald-300' : 'border-gray-300'
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-300">
        <label className="text-black block mb-2">Custom Color:</label>
        <input
          type="color"
          value={currentColor}
          onChange={(e) => onSelect(e.target.value)}
          className="w-full h-10 border-2 border-gray-300 cursor-pointer"
        />
      </div>
    </div>
  );
}