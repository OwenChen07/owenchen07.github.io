
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MoveLeft, Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../contexts/DarkModeContext';

interface LayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideNav = false }) => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { isDark, toggleDarkMode } = useDarkMode();

  return (
    <div className={`min-h-screen bg-offWhite dark:bg-darkOlive text-darkOlive dark:text-offWhite flex flex-col transition-colors duration-200 ${isHome ? 'h-screen overflow-hidden' : ''}`}>
      {!hideNav && (
        <nav className="p-4 sm:p-6 md:p-8 flex justify-between items-center z-50">
          {!isHome ? (
            <Link 
              to="/" 
              className="flex items-center gap-2 text-xs sm:text-sm font-medium tracking-widest uppercase hover:opacity-60 transition-opacity"
            >
              <MoveLeft size={14} className="sm:w-4 sm:h-4" />
              Home
            </Link>
          ) : <div></div>}
          
          {/* Only show top nav links if NOT on the home page */}
          {!isHome && (
            <div className="flex items-center gap-3 sm:gap-6 md:gap-8">
              <div className="flex gap-3 sm:gap-6 md:gap-8 text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase">
                <Link to="/about" className="hover:opacity-60 transition-opacity">About</Link>
                <Link to="/projects" className="hover:opacity-60 transition-opacity">Projects</Link>
                <Link to="/contact" className="hover:opacity-60 transition-opacity">Contact</Link>
                <Link to="/dodge-my-skills" className="hover:opacity-60 transition-opacity">Skills</Link>
              </div>
              <button
                onClick={toggleDarkMode}
                className="p-2 hover:opacity-60 transition-opacity"
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun size={16} className="sm:w-5 sm:h-5" /> : <Moon size={16} className="sm:w-5 sm:h-5" />}
              </button>
            </div>
          )}
          
          {/* Dark mode toggle on home page */}
          {isHome && (
            <button
              onClick={toggleDarkMode}
              className="p-2 hover:opacity-60 transition-opacity ml-auto"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun size={18} className="sm:w-6 sm:h-6" /> : <Moon size={18} className="sm:w-6 sm:h-6" />}
            </button>
          )}
        </nav>
      )}
      
      <main className={`flex-1 flex flex-col ${isHome ? 'justify-center items-center' : 'px-4 sm:px-6 md:px-16 lg:px-24 pt-0 pb-4 sm:pb-8 md:pb-16'}`}>
        <div className="flex-1 flex items-center justify-center">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
