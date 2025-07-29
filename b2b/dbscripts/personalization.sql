CREATE DATABASE IF NOT EXISTS CHANNEL_DB;

CREATE TABLE CHANNEL_DB.Branding (
      org VARCHAR(255) PRIMARY KEY,
      logoUrl TEXT,
      logoAltText VARCHAR(255),
      faviconUrl TEXT,
      primaryColor VARCHAR(255),
      secondaryColor VARCHAR(255)
);