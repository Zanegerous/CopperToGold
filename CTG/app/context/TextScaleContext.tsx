import React, { createContext, useState, useContext } from "react";
import { PixelRatio } from "react-native";

interface TextScaleContextProps {
  fontScale: number;
  setFontScale: (scale: number) => void;
}

const TextScaleContext = createContext<TextScaleContextProps>({
  fontScale: PixelRatio.getFontScale(), // Default system font scale
  setFontScale: () => {},
});

export const TextScaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontScale, setFontScale] = useState(PixelRatio.getFontScale());

  return (
    <TextScaleContext.Provider value={{ fontScale, setFontScale }}>
      {children}
    </TextScaleContext.Provider>
  );
};

export const useTextScale = () => useContext(TextScaleContext);
