import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaYoutube } from 'react-icons/fa';
import { 
  FooterContainer, 
  FooterWrap, 
  FooterLinkContainer, 
  FooterLinksWrap, 
  FooterLinkItems, 
  FooterLinkTitle, 
  FooterLink,
  SocialMedia, 
  SocialMediaWrap, 
  SocialLogo, 
  WebsiteRights, 
  SocialIcons, 
  SocialIconLink 
} from './FooterElements';

const useOutsideAlerter = (ref, closeDropdown) => {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        closeDropdown();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, closeDropdown]);
};

const Dropdown = ({ font, fontColor, hoverColor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => setIsOpen(false));

  const createMailtoLink = (subject) => 
    `mailto:team@migration-dashboard.com?subject=${encodeURIComponent(subject)}`;

  return (
    <div ref={wrapperRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        style={{ 
          fontFamily: font, 
          color: fontColor,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '14px',
          padding: 0,
          textAlign: 'left'
        }}
        onMouseEnter={(e) => e.target.style.color = hoverColor}
        onMouseLeave={(e) => e.target.style.color = fontColor}
      >
        Contact
      </button>
      {isOpen && (
        <div style={{
          backgroundColor: '#fff',
          boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)',
          position: 'absolute',
          width: '120px', 
          zIndex: 1,
          bottom: '100%',
          marginBottom: '5px'
        }}>
          <div style={{ display: 'block' }}>
            <a 
              href={createMailtoLink('Feedback')} 
              style={{ 
                display: 'block', 
                padding: '8px', 
                textDecoration: 'none', 
                color: 'black'
              }}
            >
              Feedback
            </a>
            <a 
              href={createMailtoLink('Questions')} 
              style={{ 
                display: 'block', 
                padding: '8px', 
                textDecoration: 'none', 
                color: 'black'
              }}
            >
              Questions
            </a>
            <a 
              href={createMailtoLink('Report Issue')} 
              style={{ 
                display: 'block', 
                padding: '8px', 
                textDecoration: 'none', 
                color: 'black'
              }}
            >
              Report
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

const SocialMediaLink = ({ href, icon: Icon, label, fontColor, hoverColor, font }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: fontColor,
        textDecoration: 'none',
        fontSize: '14px',
        fontFamily: font,
        transition: 'color 0.2s ease',
        marginBottom: '8px'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Icon size={20} style={{ color: isHovered ? hoverColor : fontColor, transition: 'color 0.2s ease' }} />
      <span style={{ color: isHovered ? hoverColor : fontColor }}>{label}</span>
    </a>
  );
};

const Footer = ({ font, fontColor, hoverColor, color }) => {
  return (
    <FooterContainer BackgroundColor={color}>
      <FooterWrap>
        <FooterLinkContainer>
          <FooterLinksWrap>
            <FooterLinkItems fontFamily={font} fontColor={fontColor}>
              <FooterLinkTitle>Get in Touch</FooterLinkTitle>
              <Dropdown font={font} fontColor={fontColor} hoverColor={hoverColor} />
            </FooterLinkItems>
            
            <FooterLinkItems fontFamily={font} fontColor={fontColor}>
              <FooterLinkTitle>Social Media</FooterLinkTitle>
              <SocialMediaLink 
                href='https://github.com/DSCI-554/project-team07/tree/main'
                icon={FaGithub}
                label='GitHub'
                fontColor={fontColor}
                hoverColor={hoverColor}
                font={font}
              />
              <SocialMediaLink 
                href='https://www.youtube.com/@DSCI554'
                icon={FaYoutube}
                label='YouTube'
                fontColor={fontColor}
                hoverColor={hoverColor}
                font={font}
              />
            </FooterLinkItems>
          </FooterLinksWrap>
        </FooterLinkContainer>
        
        <SocialMedia>
          <SocialMediaWrap>
            <SocialLogo to='/' fontColor={fontColor}>
              COVID-19 Migration Explorer
            </SocialLogo>
            <WebsiteRights fontFamily={font} fontColor={fontColor}>
              Team07 © {new Date().getFullYear()} All rights reserved.
            </WebsiteRights>
            <SocialIcons>
              <SocialIconLink 
                href='https://github.com/DSCI-554/project-team07/tree/main' 
                target='_blank' 
                aria-label='Github' 
                fontColor={fontColor} 
                hoverColor={hoverColor}
              >
                <FaGithub />
              </SocialIconLink>
              <SocialIconLink 
                href='https://www.youtube.com/@DSCI554' 
                target='_blank' 
                aria-label='YouTube' 
                fontColor={fontColor} 
                hoverColor={hoverColor}
              >
                <FaYoutube />
              </SocialIconLink>
            </SocialIcons>
          </SocialMediaWrap>
        </SocialMedia>
      </FooterWrap>
    </FooterContainer>
  );
};

export default Footer;
