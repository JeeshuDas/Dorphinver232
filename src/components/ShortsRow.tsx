import { useRef, useState } from 'react';
import { ShortsCategory } from '../types';
import { ShortCard } from './ShortCard';
import { motion } from 'motion/react';

interface ShortsRowProps {
  category: ShortsCategory;
  onShortClick: (categoryId: string, index: number) => void;
}

export function ShortsRow({ category, onShortClick }: ShortsRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="mb-6 px-4">
      <div className="flex items-center justify-between mb-3">
        <h2>{category.name}</h2>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M5 2L5 14L12 8L5 2Z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Shorts Scroll Container */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide select-none"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {category.shorts.map((short, index) => (
          <ShortCard
            key={short.id}
            video={short}
            onClick={() => onShortClick(category.id, index)}
          />
        ))}
      </div>
    </div>
  );
}
