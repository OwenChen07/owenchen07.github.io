'use client';

import { useState, useEffect, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface FullPageWrapperProps {
  children: ReactNode[];
}

const FullPageWrapper = ({ children }: FullPageWrapperProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const totalPages = children.length;

  const scrollToPage = (page: number) => {
    if (isTransitioning || page < 0 || page >= totalPages) return;
    
    setIsTransitioning(true);
    setCurrentPage(page);
    
    setTimeout(() => setIsTransitioning(false), 1000);
  };

  // Handle wheel events
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isTransitioning) return;
      
      if (e.deltaY > 0) {
        scrollToPage(Math.min(currentPage + 1, totalPages - 1));
      } else {
        scrollToPage(Math.max(currentPage - 1, 0));
      }
    };

    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentPage, isTransitioning]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioning) return;
      
      if (e.key === 'ArrowDown') {
        scrollToPage(Math.min(currentPage + 1, totalPages - 1));
      } else if (e.key === 'ArrowUp') {
        scrollToPage(Math.max(currentPage - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, isTransitioning]);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Navigation dots */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50">
        {children.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToPage(index)}
            className={`block w-3 h-3 rounded-full my-4 transition-all ${currentPage === index ? 'bg-gray-900 scale-125' : 'bg-gray-400'}`}
          />
        ))}
      </div>

      {/* Pages container */}
      <div 
        className="h-full w-full transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateY(-${currentPage * 100}vh` }}
      >
        {children}
      </div>

      {/* Down arrow indicator */}
      {currentPage < totalPages - 1 && (
        <button 
          onClick={() => scrollToPage(currentPage + 1)}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce z-50"
          disabled={isTransitioning}
        >
          <ChevronDown className="w-8 h-8 text-gray-600" />
        </button>
      )}
    </div>
  );
};

export default FullPageWrapper;