import React from 'react';
import Navigation from '../components/Navigation';

const HomePage = () => {
  return (
    <div>
      <Navigation />
      <h1 className="text-2xl font-bold text-center mt-10">Welcome to Our E-commerce Store</h1>
      <p className="text-center mt-4">Explore a wide range of products across various categories.</p>
    </div>
  );
};

export default HomePage;