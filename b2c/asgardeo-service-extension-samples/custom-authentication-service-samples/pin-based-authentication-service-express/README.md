# Pin-Based Authentication Service

This is a Node.js Express-based authentication service that provides a PIN-based authentication mechanism. The service can run locally and is designed to work in both federated and internal authentication modes, with support for second-factor authentication.

> **Note:** This sample is for demonstration only and should not be used in production. It supports the **service-based custom authenticator feature** of both [Asgardeo](https://console.asgardeo.io/) and [WSO2 Identity Server](https://wso2.com/identity-server/).

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
  - [1️⃣ Clone the Repository](#1-clone-the-repository)
  - [2️⃣ Install Dependencies](#2-install-dependencies)
  - [3️⃣ Configure Environment Variables](#3-configure-environment-variables)
  - [4️⃣ Add Users for Authentication](#4-add-users-for-authentication)
  - [5️⃣ Run the Service](#5-run-the-service)
    - [Run the Service Locally](#run-the-service-locally)
    - [Deploy to Vercel (Required for Asgardeo)](#deploy-to-vercel-required-for-asgardeo)
  - [6️⃣ Verify the Service](#6-verify-the-service)
- [Configure the Authenticator in Product](#7-configure-the-authenticator-in-product)
  - [In WSO2 Identity Server](#configuring-the-authenticator-in-wso2-identity-server)
  - [In Asgardeo](#configuring-the-authenticator-in-asgardeo)
- [API Endpoints](#api-endpoints)

## Overview
This service implements PIN-based authentication using an in-memory map for session persistence. It supports:

- Federated and internal user authentication (with username + PIN)
- Second-factor authentication (PIN only)

## Features
- PIN-based authentication mechanism
- Session persistence with an **in-memory map**
- Supports **federated**, **internal**, and **second-factor** authentication
- Compatible with both **Vercel** deployments and local setups

## Prerequisites
Ensure you have the following installed:
- **Node.js** (>=14.x)
- **npm**

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/asgardeo-samples/asgardeo-service-extension-samples.git
cd custom-authentication-service-samples/pin-based-authentication-service-express/src
```

[← Back to Table of Contents](#table-of-contents)

### 2. Install Dependencies

```bash
npm install
```
[← Back to Table of Contents](#table-of-contents)

### 3. Configure Environment Variables

Update the `.env` file in the project root (`src`) with the following:

```env
AUTH_MODE=federated  # Options: federated, internal, second_factor
BASE_WSO2_IAM_PROVIDER_URL=https://localhost:9443
HOST_URL=http://localhost:3000
```

- `AUTH_MODE`: Defines whether the service operates as a **federated authenticator**, an authenticator for **internally managed users**, or a **second-factor authentication service**.
  - If `AUTH_MODE` is `federated` or `internal`, the authenticator prompts for **username and PIN**.
  - If `AUTH_MODE` is `second_factor`, the authenticator prompts for **PIN only**, and authenticates the user provided in the request from WSO2 Identity Server with PIN.
- `BASE_WSO2_IAM_PROVIDER_URL`: Specifies the **host origin** of the running WSO2 Identity Server instance or Asgardeo.
        
        For WSO2 Identity Server: https://your-identity-server-host:9443
        For Asgardeo: https://api.asgardeo.io
- `HOST_URL`: Specifies the **host origin** of the running authentication service.
        
        If service is running locally: http://localhost:3000
        If service is running in Vercel: https://your-vercel-app.vercel.app (e.g., https://pin-based-authentication-service-express.vercel.app)

[← Back to Table of Contents](#table-of-contents)

### 4. Add Users for Authentication

Before running the service, define the users that need to be authenticated.

Update the `users.json` file inside the `data/` directory with the following structure:

```json
{
  "federated": [
      {
          "id": "8a2b49b5-91fa-4f3b-b2d8-d12f7f77dcaa",
          "username": "peterp",
          "pin": "5678",
          "data": {
            "id": "8a2b49b5-91fa-4f3b-b2d8-d12f7f77dcaa",
            "claims": [
              {
                "uri": "http://wso2.org/claims/username",
                "value": "peterp@goodwill.com"
              },
              {
                "uri": "http://wso2.org/claims/emailaddress",
                "value": "peterp@goodwill.com"
              },
              {
                "uri": "http://wso2.org/claims/lastname",
                "value": "Parker"
              },
              {
                "uri": "http://wso2.org/claims/givenname",
                "value": "Peter"
              }
            ]
          }
        }
  ],
  "internal": [
    {
      "id": "ed8fa3ee-e1d0-43c7-bf1b-afe05dee4838",
      "username": "emilye",
      "pin": "1234",
      "data": {
        "id": "ed8fa3ee-e1d0-43c7-bf1b-afe05dee4838",
        "claims": [
          {
            "uri": "http://wso2.org/claims/username",
            "value": "emily@aol.com"
          },
          {
            "uri": "http://wso2.org/claims/emailaddress",
            "value": "emily@aol.com"
          },
          {
            "uri": "http://wso2.org/claims/lastname",
            "value": "Ellon"
          },
          {
            "uri": "http://wso2.org/claims/givenname",
            "value": "Emily"
          }
        ]
      }
    }
  ]
}
```

- **Internal users**: Ensure that you have users in **Asgardeo/WSO2 Identity Server** matching the `id` and `username` fields.
- **Federated users**: External users **do not** need to be pre-registered in Asgardeo/WSO2 Identity Server.
- To authenticate, use the username and PIN specified in this file in `username` and `pin` fields to ensure successful authentication.

[← Back to Table of Contents](#table-of-contents)

### 5. Run the Service

### Run the Service Locally

```bash
node api/index.js
```

The service will be available at: **[http://localhost:3000](http://localhost:3000)**

[← Back to Table of Contents](#table-of-contents)

### Deploy to Vercel (Required for Asgardeo)

> **Note:** Asgardeo can access only internet accessible services. So you can use a Vercel-like hosting tool to host your service.

To deploy to **Vercel**, follow these steps:

1. Make sure you have a vercel account.
2. From the project root (`src`) run below.

    ```bash
    vercel --prod
    ```

    If you are setting up for the first time, the above command will prompt a set of questions. Refer to the image below.
    
    ![vercel-setup](images/vercel-setup.png)


#### Vercel Configuration Steps

1. **Set Environment Variables**:

   - In Vercel, go to **Project Settings → Environment Variables**.
   - Add `AUTH_MODE` with the preferred authenticator type (`federated`, `internal`, or `second_factor`).
   - Add `BASE_WSO2_IAM_PROVIDER_URL` based on the product.
        
        For WSO2 Identity Server: https://your-identity-server-host:9443
        
        For Asgardeo: https://api.asgardeo.io
   - Add `HOST_URL` pointing to your vercel app domain.
        
        https://your-vercel-app.vercel.app 
        
        e.g., https://pin-based-authentication-service-express.vercel.app
        
   - Add `USER_CONFIG` by converting the `users.json` file into a compact string:
     ```bash
     cat data/users.json | jq -c
     ```
     Copy and paste the output as the value for `USER_CONFIG` in Vercel.

2. **Deploy to Vercel**:

    ```bash
    vercel --prod
    ```
[← Back to Table of Contents](#table-of-contents)

### 6. Verify the Service

Run a health check to ensure the service is running:

**If service is running locally:**

```bash
curl http://localhost:3000/api/health
```

**If service is running in Vercel:**

```bash
curl https://your-vercel-app.vercel.app/api/health
```

e.g.,
```
curl https://pin-based-authentication-service-express.vercel.app/api/health
```

Expected Response:

```json
{ "status": "ok", "message": "Service is running." }
```

[← Back to Table of Contents](#table-of-contents)

### 7. Configure the Authenticator in Product

#### Configuring the Authenticator in WSO2 Identity Server
To integrate this authentication service with WSO2 Identity Server, follow the step-by-step guide at the [documentation](https://is.docs.wso2.com/en/next/guides/service-extensions/in-flow-extensions/custom-authentication/#configure-the-custom-authenticator-in-wso2-identity-server).

#### Configuring the Authenticator in Asgardeo
To integrate this authentication service with Asgardeo, follow the step-by-step guide at the [documentation](https://stasgrdocsdeeus201.z20.web.core.windows.net/asgardeo/docs/guides/service-extensions/in-flow-extensions/custom-authentication/#configure-the-custom-authenticator-in-asgardeo).

#### Considerations applicable for both products

When configuring the authenticator, consider the following:

1. Select the appropriate authenticator type based on the `AUTH_MODE` configured in the environment variables:

   - External (Federated) User Authentication
   - Internal User Authentication
   - 2FA Authentication

2. Set the authentication endpoint to your deployed service URL:
   - If running locally: http://localhost:3000/api/authenticate
   - If deployed in Vercel: https://your-vercel-app.vercel.app/api/authenticate

Configure user attributes to be shared with the application. Ensure that the attributes retrieved from the authenticator are correctly mapped to the application’s requirements.

Once configured, Asgardeo/WSO2 Identity Server will utilize this service for PIN-based authentication.

[← Back to Table of Contents](#table-of-contents)

## API Endpoints

### **Health Check**

This endpoint is to check if the service is successfully running.

- **GET** `/api/health`
- **Response:** `{ "status": "ok", "message": "Service is running." }`

### **Authenticate User**

This is the endpoint that will receive requests from the Identity Server for user authentication.

- **POST** `/api/authenticate`
- **Request Body:**

```json
{
  "flowId": "1234",
  "event": {
    "tenant": { "name": "example.com" },
    "user": { "id": "5678" }
  }
}
```

- **Response:**

```json
{
  "actionStatus": "INCOMPLETE",
  "operations": [{ "op": "redirect", "url": "http://localhost:3000/api/pin-entry?flowId=1234" }]
}
```

### **PIN Entry Page**

This is a page with a form to collect username and the PIN.

- **GET** `/api/pin-entry?flowId=1234`
- **Returns:** HTML page for entering PIN.

### **Validate PIN**

This endpoint checks if a user exists for the given username and the PIN.

- **POST** `/api/validate-pin`
- **Request Body:**

```json
{
  "flowId": "1234",
  "userId": "5678",
  "pin": "1234",
  "tenant": "example.com"
}
```

- **Response:**

```json
{
  "redirectingTo": "https://your-identity-server-or-asgardeo-url/commonauth?flowId=1234"
}
```

[← Back to Table of Contents](#table-of-contents)