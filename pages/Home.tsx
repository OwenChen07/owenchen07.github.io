
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
            <Link to="/dodge-my-skills" className="hover:opacity-60 transition-opacity">Skills</Link>
          </nav>
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
