import React from 'react';
import ReactDOM from 'react-dom';

const PandaLandingPage = () => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f0e68c' }}>
      <h1>Welcome to the Pandas Landing Page</h1>
      <p>Discover the amazing world of pandas with us!</p>
      <img src="https://img.magnific.com/free-photo/adorable-giant-panda_23-2151936052.jpg?semt=ais_hybrid" alt="Pandas" style={{ maxWidth: '100%', height: 'auto' }} />
      <p>Learn more about pandas and their fascinating characteristics.</p>
    </div>
  );
};

ReactDOM.render(<PandaLandingPage />, document.getElementById('root'));