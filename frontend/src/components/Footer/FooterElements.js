import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const FooterContainer = styled.footer`
  background-color: ${({ BackgroundColor }) => (BackgroundColor ? BackgroundColor : '#2c3e50')};
  padding: 40px 0 20px 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const FooterWrap = styled.div`
  padding: 24px 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
`;

export const FooterLinkContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;

  @media screen and (max-width: 820px) {
    padding-top: 32px;
  }
`;

export const FooterLinksWrap = styled.div`
  display: flex;
  gap: 100px;

  @media screen and (max-width: 820px) {
    flex-direction: column;
    gap: 20px;
  }
`;

export const FooterLinkItems = styled.div.withConfig({
  shouldForwardProp: (prop) => !['fontColor', 'fontFamily'].includes(prop),
})`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  min-width: 160px;
  box-sizing: border-box;
  color: ${({ fontColor }) => (fontColor ? fontColor : '#fff')};
  font-family: ${({ fontFamily }) => (fontFamily ? fontFamily : 'Arial')};

  @media screen and (max-width: 420px) {
    margin: 0;
    padding: 10px;
    width: 100%;
  }
`;

export const FooterLinkTitle = styled.h2`
  font-size: 16px;
  margin-bottom: 16px;
  font-weight: bold;
`;

export const FooterLink = styled(Link).withConfig({
  shouldForwardProp: (prop) => !['fontColor', 'hoverColor'].includes(prop),
})`
  color: ${({ fontColor }) => (fontColor ? fontColor : '#fff')};
  text-decoration: none;
  margin-bottom: 8px;
  font-size: 14px;
  transition: color 0.2s ease-in-out;

  &:hover {
    color: ${({ hoverColor }) => (hoverColor ? hoverColor : '#3498db')};
  }
`;

export const SocialMedia = styled.section`
  max-width: 1400px;
  width: 100%;
`;

export const SocialMediaWrap = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  max-width: 1400px;
  margin: 40px auto 0 auto;
  padding: 0 20px;

  @media screen and (max-width: 820px) {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
`;

export const SocialLogo = styled(Link).withConfig({
  shouldForwardProp: (prop) => !['fontColor'].includes(prop),
})`
  color: ${({ fontColor }) => (fontColor ? fontColor : '#fff')};
  justify-self: start;
  cursor: pointer;
  text-decoration: none;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  font-weight: bold;

  @media screen and (max-width: 820px) {
    margin-bottom: 16px;
  }
`;

export const WebsiteRights = styled.small.withConfig({
  shouldForwardProp: (prop) => !['fontColor', 'fontFamily'].includes(prop),
})`
  color: ${({ fontColor }) => (fontColor ? fontColor : '#fff')};
  font-family: ${({ fontFamily }) => (fontFamily ? fontFamily : 'Arial')};
  justify-self: center;
  text-align: center;

  @media screen and (max-width: 820px) {
    margin-bottom: 16px;
  }
`;

export const SocialIcons = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 30px;
  padding-right: 240px;
  justify-self: end;
`;

export const SocialIconLink = styled.a.withConfig({
  shouldForwardProp: (prop) => !['fontColor', 'hoverColor'].includes(prop),
})`
  color: ${({ fontColor }) => (fontColor ? fontColor : '#fff')};
  font-size: 24px;
  transition: color 0.2s ease-in-out;

  &:hover {
    color: ${({ hoverColor }) => (hoverColor ? hoverColor : '#3498db')};
  }
`;
