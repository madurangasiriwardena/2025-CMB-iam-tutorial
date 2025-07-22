import React, { createContext, useContext, ReactNode } from "react";
import { AsgardeoConfig } from "./config-loader";

const ConfigContext = createContext<AsgardeoConfig | null>(null);

export const ConfigProvider = ({ config, children }:{ config: AsgardeoConfig; children: ReactNode; }) => (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
);

export const useConfig = () => useContext(ConfigContext);
