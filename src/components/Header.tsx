import { useState, useEffect } from 'react';
import { Github, Linkedin, Mail, FileText } from 'lucide-react';

const Header = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const email = 'owenchenyp@gmail.com';

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleEmailClick = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      alert('Failed to copy email address.');
    });
  };

  return (
    <header className={`h-screen px-6 text-center flex items-center justify-center transition-all duration-1000 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-7xl md:text-8xl font-computer-modern font-bold mb-8 text-gray-900">
          Owen Chen
        </h1>
        <p className="text-2xl md:text-3xl font-computer-modern text-gray-600 mb-10 leading-relaxed">
          Computer Science Student @ University of Waterloo
        </p>
        <p className="text-xl font-computer-modern text-gray-500 mb-16 max-w-2xl mx-auto leading-relaxed">
          Passionate about algorithms, software development, and building elegant solutions to complex problems.
        </p>
        
        <div className="flex justify-center space-x-8 relative">
          {[
            { icon: Github, href: 'https://github.com/OwenChen07/', label: 'GitHub', onClick: null },
            { icon: Linkedin, href: 'https://www.linkedin.com/in/owenchen07/', label: 'LinkedIn', onClick: null },
            { icon: Mail, label: 'Email', onClick: handleEmailClick },
          ].map((item, index) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={item.onClick}
              className="group p-3 rounded-full border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <item.icon className="w-6 h-6 text-gray-600 group-hover:text-gray-900 transition-colors duration-300" />
            </a>
          ))}
        </div>
        
        {/* Email copied notification - now fixed to viewport */}
        {copied && (
          <div className="fixed left-1/2 transform -translate-x-1/2 -translate-y-full border border-gray-600 bg-white text-black text-sm rounded px-3 py-1 shadow-lg animate-[fadeInOut_2s_ease-in-out_forwards]">
            Email copied!
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;