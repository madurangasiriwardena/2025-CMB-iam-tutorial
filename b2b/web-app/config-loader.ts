export interface AsgardeoConfig {
  clientID: string;
  baseUrl: string;
  signInRedirectURL: string;
  signOutRedirectURL: string;
  scope: string[];
}

export const loadConfig = async (): Promise<AsgardeoConfig> => {
  const response = await fetch("/runtime-config.json");
  if (!response.ok) {
    throw new Error("Failed to load runtime config");
  }
  return await response.json();
};
