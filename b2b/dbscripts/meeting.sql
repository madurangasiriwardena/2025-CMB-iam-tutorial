CREATE DATABASE IF NOT EXISTS CHANNEL_DB;

CREATE TABLE CHANNEL_DB.Meeting (
      id VARCHAR(255) PRIMARY KEY,
      org VARCHAR(255),
      createdAt VARCHAR(255),
      topic VARCHAR(255),
      date VARCHAR(255),
      startTime VARCHAR(255),
      duration VARCHAR(255),
      timeZone VARCHAR(255),
      userId VARCHAR(255),
      emailAddress VARCHAR(255),
      actorUserId VARCHAR(255)
);