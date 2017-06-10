import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return(
    <header className='logo'>
      <Link to="/">Tailor Swift</Link>
    </header>
  );

};

export default Header;
