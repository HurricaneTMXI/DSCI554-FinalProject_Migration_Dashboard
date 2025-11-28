import React, { useState, useEffect, useRef } from 'react';
import { FaBars, FaFont, FaPaintBrush } from "react-icons/fa";
import { IconContext } from "react-icons/lib";
import './NavbarStyle.css';
import {
  Nav,
  NavbarContainer,
  NavLogo,
  MobileNav,
  MobileIcon,
  NavMenu,
  NavItem,
  NavLinks,
} from "./NavbarElements";
import { animateScroll as scroll } from "react-scroll";

const Navbar = ({ 
  toggle, 
  changeFont, 
  font, 
  changeBackgroundColor, 
  color, 
  changeFontColor, 
  fontColor, 
  changeHoverColor, 
  hoverColor 
}) => {
  const [scrollNav, setScrollNav] = useState(false);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);

  const fontRef = useRef(null);
  const colorRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fontRef.current && !fontRef.current.contains(event.target)) {
        setShowFontDropdown(false);
      }
      if (colorRef.current && !colorRef.current.contains(event.target)) {
        setShowColorDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const changeNav = () => {
    if (window.scrollY >= 100) {
      setScrollNav(true);
    } else {
      setScrollNav(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", changeNav);
    return () => window.removeEventListener("scroll", changeNav);
  }, []);

  const toggleHome = () => {
    scroll.scrollToTop();
  };

  const handleFontClick = () => {
    setShowFontDropdown(!showFontDropdown);
    setShowColorDropdown(false);
  };

  const handleColorClick = () => {
    setShowColorDropdown(!showColorDropdown);
    setShowFontDropdown(false);
  };

  const handleFontChange = (newFont) => {
    console.log('Changing font to:', newFont); // Debug log
    changeFont(newFont);
    setShowFontDropdown(false);
  };

  return (
    <>
      <IconContext.Provider value={{ color: "#fff" }}>
        <Nav scrollNav={scrollNav} background={color}>
          <NavbarContainer>
            <NavLogo to="/" onClick={toggleHome} fontColor={fontColor}>
              COVID-19 Migration Explorer
            </NavLogo>
            <MobileNav to="/" onClick={toggleHome} fontColor={fontColor}>
              Migration
            </MobileNav>
            <MobileIcon onClick={toggle} fontColor={fontColor}>
              <FaBars />
            </MobileIcon>
            <NavMenu>
              <NavItem fontFamily={font}>
                <NavLinks
                  to="home"
                  smooth={true}
                  duration={500}
                  spy={true}
                  exact="true"
                  offset={-80}
                  activeClass="active"
                  fontColor={fontColor}
                  hoverColor={hoverColor}
                >
                  Home
                </NavLinks>
              </NavItem>
              <NavItem fontFamily={font}>
                <NavLinks
                  to="dashboard"
                  smooth={true}
                  duration={500}
                  spy={true}
                  exact="true"
                  offset={-80}
                  activeClass="active"
                  fontColor={fontColor}
                  hoverColor={hoverColor}
                >
                  Dashboard
                </NavLinks>
              </NavItem>
              <NavItem fontFamily={font}>
                <NavLinks
                  to="insights"
                  smooth={true}
                  duration={500}
                  spy={true}
                  exact="true"
                  offset={-80}
                  activeClass="active"
                  fontColor={fontColor}
                  hoverColor={hoverColor}
                >
                  Insights
                </NavLinks>
              </NavItem>
              <NavItem fontFamily={font}>
                <NavLinks
                  to="about"
                  smooth={true}
                  duration={500}
                  spy={true}
                  exact="true"
                  offset={-80}
                  activeClass="active"
                  fontColor={fontColor}
                  hoverColor={hoverColor}
                >
                  About
                </NavLinks>
              </NavItem>
            </NavMenu>
      
            <div className="icon-container">
              <div 
                className="icon-with-text" 
                ref={fontRef} 
                onClick={handleFontClick}
              >
                <FaFont size="20" className="icon" style={{ color: fontColor }}/>
                <span className="icon-text" style={{ color: fontColor, fontFamily: font }}>
                  Font
                </span>
                {showFontDropdown && (
                  <div className="dropdown">
                    <ul>
                      <li 
                        onClick={() => handleFontChange('Arial, sans-serif')}
                        className="font-item"
                        style={{ fontFamily: 'Arial, sans-serif' }}
                      >
                        Default
                      </li>
                      <li 
                        onClick={() => handleFontChange('Verdana, sans-serif')}
                        className="font-item"
                        style={{ fontFamily: 'Verdana, sans-serif' }}
                      >
                        Verdana
                      </li>
                      <li 
                        onClick={() => handleFontChange('Georgia, serif')}
                        className="font-item"
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        Georgia
                      </li>
                      <li 
                        onClick={() => handleFontChange('"Courier New", monospace')}
                        className="font-item"
                        style={{ fontFamily: '"Courier New", monospace' }}
                      >
                        Courier
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              
              <div 
                className="icon-with-text" 
                ref={colorRef} 
                onClick={handleColorClick}
              >
                <FaPaintBrush size="20" style={{ color: fontColor }} className="icon"/>
                <span className="icon-text" style={{ color: fontColor, fontFamily: font }}>
                  Theme
                </span>
                {showColorDropdown && (
                  <div className="dropdown">
                    <ul>
                      <li onClick={() => {
                        changeBackgroundColor('#2c3e50'); 
                        changeFontColor('white'); 
                        changeHoverColor('#3498db');
                        setShowColorDropdown(false);
                      }}>
                        Default (Dark)
                      </li>
                      <li onClick={() => {
                        changeBackgroundColor('#ecf0f1'); 
                        changeFontColor('#2c3e50'); 
                        changeHoverColor('#e74c3c');
                        setShowColorDropdown(false);
                      }}>
                        Light Mode
                      </li>
                      <li onClick={() => {
                        changeBackgroundColor('#34495e'); 
                        changeFontColor('#ecf0f1'); 
                        changeHoverColor('#1abc9c');
                        setShowColorDropdown(false);
                      }}>
                        Ocean Theme
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </NavbarContainer>
        </Nav>
      </IconContext.Provider>
    </>
  );
};

export default Navbar;
