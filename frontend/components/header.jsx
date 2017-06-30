import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return(
    <header className='logo'>
      <Link to="/">
        <div className='logo-icon'></div>
        <p>Tailor Swift</p>
      </Link>
    </header>
  );

};

export default Header;
