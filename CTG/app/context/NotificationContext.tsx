import React, { createContext, useState, useContext } from "react"

const NotificationContext = createContext({
    isNotif: true,
    toggleNotifications: () => {}
  });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isNotif, setIsNotif] = useState(false);

  const toggleNotifications = () => {
    setIsNotif((prev) => !prev);
  };

  return (
    <NotificationContext.Provider value={{ isNotif, toggleNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifSetting() {
  return useContext(NotificationContext);
}
