import React from 'react';
import "./footer.css";
import Logo from "../../assets/logo.png"
const Footer = () => {
  return (
    <div className='footer_container'>
      <img src={Logo} alt="Logo" />
      <h5>AJ &copy;2024</h5>
    </div>
  )
}

export default Footer