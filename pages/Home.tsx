
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const Home: React.FC = () => {
  return (
    <Layout>
      <div className="text-center space-y-8 sm:space-y-12 max-w-4xl px-4 sm:px-6 flex flex-col items-center">
        <h1 className="text-5xl sm:text-7xl md:text-9xl font-bold leading-tight tracking-tighter">
          Owen Chen
        </h1>
        
        <div className="flex flex-col items-center gap-6 sm:gap-8">
          <nav className="flex flex-wrap justify-center gap-x-8 sm:gap-x-12 gap-y-3 sm:gap-y-4 text-xs sm:text-sm font-medium tracking-[0.3em] uppercase">
            <Link to="/about" className="hover:opacity-60 transition-opacity">About</Link>
            <Link to="/projects" className="hover:opacity-60 transition-opacity">Projects</Link>
            <Link to="/contact" className="hover:opacity-60 transition-opacity">Contact</Link>
            <Link to="/dodge-my-skills" className="hover:opacity-60 transition-opacity">Skills</Link>
          </nav>
        </div>
      </div>
      
      <div className="absolute bottom-4 sm:bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs md:text-sm tracking-[0.3em] uppercase opacity-40 px-4">
        <span>Software Engineer</span>
        <span className="hidden sm:inline">•</span>
        <span className="w-full sm:w-auto text-center">Seeking Summer 2026 Internships</span>
      </div>
    </Layout>
  );
};

export default Home;
