import styled from 'styled-components';
import { Link as LinkRouter } from 'react-router-dom';
import { Link as LinkScroll } from 'react-scroll';

export const Nav = styled.nav`
  background: ${({ background }) => (background ? background : '#2c3e50')};
  height: 180px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1rem;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: 0.8s all ease;
  overflow: visible;

  @media screen and (max-width: 960px) {
    transition: 0.8s all ease;
  }
`;

export const NavbarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100px;
  z-index: 1;
  width: 100%;
  padding: 0 24px;
  max-width: 1400px;
  overflow: visible;
`;

export const NavLogo = styled(LinkRouter).withConfig({
  shouldForwardProp: (prop) => !['fontColor'].includes(prop),
})`
  color: ${({ fontColor }) => (fontColor ? fontColor : '#fff')};
  justify-self: flex-start;
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  font-weight: bold;
  text-decoration: none;
  padding: 0 10px;

  img {
    height: 50px;
  }

  @media screen and (max-width: 768px) {
    display: none;
  }
`;

export const MobileNav = styled(LinkRouter).withConfig({
  shouldForwardProp: (prop) => !['fontColor'].includes(prop),
})`
  display: none;

  @media screen and (max-width: 768px) {
    display: block;
    color: ${({ fontColor }) => (fontColor ? fontColor : '#fff')};
    cursor: pointer;
    font-size: 1.5rem;
    align-items: center;
    font-weight: bold;
    text-decoration: none;
  }
`;

export const MobileIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => !['fontColor'].includes(prop),
})`
  display: none;

  @media screen and (max-width: 768px) {
    display: block;
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(-100%, 60%);
    font-size: 1.8rem;
    cursor: pointer;
    color: ${({ fontColor }) => (fontColor ? fontColor : '#fff')};
  }
`;

export const NavMenu = styled.ul`
  display: flex;
  align-items: center;
  list-style: none;
  text-align: center;
  margin: 0;

  @media screen and (max-width: 768px) {
    display: none;
  }
`;

export const NavItem = styled.li`
  height: 100px;
  font-family: ${({ fontFamily }) => (fontFamily ? fontFamily : 'Arial')};
`;

export const NavLinks = styled(LinkScroll).withConfig({
  shouldForwardProp: (prop) => !['fontColor', 'hoverColor'].includes(prop),
})`
  color: ${({ fontColor }) => (fontColor ? fontColor : '#fff')};
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: 0 1rem;
  height: 100%;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease-in-out;

  &.active {
    border-bottom: 3px solid ${({ hoverColor }) => (hoverColor ? hoverColor : '#3498db')};
  }

  &:hover {
    color: ${({ hoverColor }) => (hoverColor ? hoverColor : '#3498db')};
    transform: translateY(-2px);
  }
`;

export const NavBtn = styled.nav`
  display: flex;
  align-items: center;

  @media screen and (max-width: 768px) {
    display: none;
  }
`;
