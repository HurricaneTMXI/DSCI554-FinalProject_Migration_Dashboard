import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import "./App.css";

function App() {
  const [font, setFont] = useState('Arial, sans-serif');
  const [color, setColor] = useState('#2c3e50');
  const [fontColor, setFontColor] = useState('white');
  const [hoverColor, setHoverColor] = useState('#3498db');

  const changeFont = (newFont) => {
    console.log('App.js: Changing font to:', newFont); // Debug log
    setFont(newFont);
  };
  
  const changeBackgroundColor = (newColor) => setColor(newColor);
  const changeFontColor = (newColor) => setFontColor(newColor);
  const changeHoverColor = (newColor) => setHoverColor(newColor);

  // Apply font globally to body element
  React.useEffect(() => {
    console.log('App.js: Applying font to body:', font); // Debug log
    document.body.style.fontFamily = font;
  }, [font]);

  return (
    <Router basename="/DSCI554-FinalProject_Migration_Dashboard">
      <Routes>
        <Route 
          path="/" 
          element={
            <Home 
              font={font}
              color={color}
              fontColor={fontColor}
              hoverColor={hoverColor}
              changeFont={changeFont}
              changeBackgroundColor={changeBackgroundColor}
              changeFontColor={changeFontColor}
              changeHoverColor={changeHoverColor}
            />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
