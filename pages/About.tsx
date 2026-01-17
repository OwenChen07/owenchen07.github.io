
import React from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  return (
    <Layout>
      <div className="w-full flex flex-col items-center">
        <div className="pt-8 md:pt-12 mb-8 w-full max-w-2xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 italic border-b border-darkOlive/20 pb-4 text-center">
            About
          </h1>
        </div>
        <div className="flex justify-center"> 
          <div className="max-w-2xl text-center space-y-6 text-2xl md:text-3xl leading-relaxed font-light">
            <p>
              Hi I'm Owen, a first year CS student at the <span className="font-bold">University of Waterloo</span>. I'm passionate about software development and machine learning.
            </p>
            <br></br>
            <p>
              When I'm not coding, you'll find me playing volleyball, poker or video games.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
