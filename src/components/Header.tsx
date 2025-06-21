
import { useState, useEffect } from 'react';
import { Github, Linkedin, Mail, FileText } from 'lucide-react';

const Header = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <header className={`py-32 px-6 text-center transition-all duration-1000 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-7xl md:text-8xl font-computer-modern font-bold mb-8 text-gray-900">
          John Doe
        </h1>
        <p className="text-2xl md:text-3xl font-computer-modern text-gray-600 mb-10 leading-relaxed">
          Computer Science Student
        </p>
        <p className="text-xl font-computer-modern text-gray-500 mb-16 max-w-2xl mx-auto leading-relaxed">
          Passionate about algorithms, artificial intelligence, and building elegant solutions to complex problems.
        </p>
        
        <div className="flex justify-center space-x-8">
          {[
            { icon: Github, href: '#', label: 'GitHub' },
            { icon: Linkedin, href: '#', label: 'LinkedIn' },
            { icon: Mail, href: '#', label: 'Email' },
            { icon: FileText, href: '#', label: 'Resume' }
          ].map((item, index) => (
            <a
              key={item.label}
              href={item.href}
              className="group p-3 rounded-full border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <item.icon className="w-6 h-6 text-gray-600 group-hover:text-gray-900 transition-colors duration-300" />
            </a>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
