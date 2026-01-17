
import React from 'react';
import Layout from '../components/Layout';
import { Mail, Github, Linkedin } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <Layout>
      <div className="w-full flex flex-col items-center">
        <div className="pt-4 sm:pt-8 md:pt-12 mb-6 sm:mb-8 w-full max-w-2xl mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 sm:mb-8 italic border-b border-darkOlive/20 pb-4 text-center">
            Contact
          </h1>
        </div>
        <div className="flex justify-center gap-6 sm:gap-8">
          <a 
            href="https://www.linkedin.com/in/owenchen07" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:opacity-50 transition-opacity">
            <Linkedin size={32} className="sm:w-10 sm:h-10" />
          </a>
          
          <a 
            href="https://github.com/OwenChen07" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:opacity-50 transition-opacity"
          >
            <Github size={32} className="sm:w-10 sm:h-10" />
          </a>
          
          <a 
            href="mailto:owenchenyp@gmail.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:opacity-50 transition-opacity"
          >
            <Mail size={32} className="sm:w-10 sm:h-10" />
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
