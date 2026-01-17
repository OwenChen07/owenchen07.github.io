
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MoveLeft } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideNav = false }) => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className={`min-h-screen bg-offWhite text-darkOlive flex flex-col ${isHome ? 'h-screen overflow-hidden' : ''}`}>
      {!hideNav && (
        <nav className="p-8 flex justify-between items-center z-50">
          {!isHome ? (
            <Link 
              to="/" 
              className="flex items-center gap-2 text-sm font-medium tracking-widest uppercase hover:opacity-60 transition-opacity"
            >
              <MoveLeft size={16} />
              Home
            </Link>
          ) : (null)}
          
          {/* Only show top nav links if NOT on the home page */}
          {!isHome && (
            <div className="flex gap-8 text-xs font-medium tracking-[0.2em] uppercase">
              <Link to="/about" className="hover:opacity-60 transition-opacity">About</Link>
              <Link to="/projects" className="hover:opacity-60 transition-opacity">Projects</Link>
              <Link to="/contact" className="hover:opacity-60 transition-opacity">Contact</Link>
              <Link to="/dodge-my-skills" className="hover:opacity-60 transition-opacity">Dodge</Link>
            </div>
          )}
        </nav>
      )}
      
      <main className={`flex-1 flex flex-col ${isHome ? 'justify-center items-center' : 'px-8 md:px-16 lg:px-24 pt-0 pb-8 md:pb-16'}`}>
        <div className="flex-1 flex items-center justify-center">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
