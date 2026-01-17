
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const Home: React.FC = () => {
  return (
    <Layout>
      <div className="text-center space-y-12 max-w-4xl px-4 flex flex-col items-center">
        <h1 className="text-7xl md:text-9xl font-bold leading-tight tracking-tighter">
          Owen Chen
        </h1>
        
        <div className="flex flex-col items-center gap-8">
          <nav className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-sm font-medium tracking-[0.3em] uppercase">
            <Link to="/about" className="hover:opacity-60 transition-opacity">About</Link>
            <Link to="/projects" className="hover:opacity-60 transition-opacity">Projects</Link>
            <Link to="/contact" className="hover:opacity-60 transition-opacity">Contact</Link>
          </nav>

          <Link 
            to="/dodge-my-skills" 
            className="group relative px-10 py-4 overflow-hidden border border-darkOlive bg-darkOlive text-offWhite mt-4 transition-all hover:pr-14"
          >
            <span className="relative z-10 font-bold tracking-[0.25em] uppercase text-[10px]">Skills</span>
            <div className="absolute inset-0 bg-offWhite translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="absolute inset-0 z-20 flex items-center justify-center text-darkOlive opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-bold tracking-[0.25em] uppercase text-[10px]">
              Play Game
            </span>
          </Link>
        </div>
      </div>
      
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 text-sm tracking-[0.3em] uppercase opacity-40">
        <span>Software Engineer</span>
        <span>•</span>
        <span>Seeking Summer 2026 Internships</span>
      </div>
    </Layout>
  );
};

export default Home;
