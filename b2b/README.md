# Teamspace B2B app with Next.js and Asgardeo

## Introduction

Let's explore a use case to set the context for this guide.

"Teamspace" is an application designed to provide video conferencing for organizations. It provides functionalities for signing up as organizations, managing video conferences of the organization, managing team members and other organization configurations such as IdP of the organization and multi-factor authentication.

In Teamspace, each signed-up organization is represented as an organization under the root organization. This hierarchical structure allows for multiple teams, each with their own administrators and members.

### Organizational hierarchy:

<img src="https://github.com/user-attachments/assets/5cdf199b-4ce0-4661-8763-1c0cddef35f0" alt="Image" width="500" style="display: block; margin: 0;" />
<br />

Worklink, Elite Solutions, Nuvora, etc., are considered organizations under the root organization, Teamspace.

### Teamspace home page:

<img width="800" alt="Image" src="https://github.com/user-attachments/assets/14dc1772-7566-4b60-b455-cd68c1390239" />

## Prerequisites

Before you start, ensure you have the following:

- Asgardeo account
- Node.js v18+ and npm
- A favorite text editor or IDE
- Install Ballerina 2201.5.0 [Download Ballerina](https://dist.ballerina.io/downloads/2201.5.0/ballerina-2201.5.0-swan-lake-macos-arm-x64.pkg)

## Deploy API Services

Navigate to `<PROJECT_HOME>/b2b/apis/meeting-service` and start the meeting service by executing the following command in the terminal:

```bash
bal run
```

Navigate to `<PROJECT_HOME>/b2b/apis/personalization-service` and start the personalization service by executing the following command in the terminal:

```bash
bal run
```

## Register an application in Asgardeo

If you have not already done so, create an organization in Asgardeo before registering an application.

1. Sign up for an Asgardeo account.
2. Sign into Asgardeo console and navigate to Applications > New Application.
3. Select Traditional Web Application.

  <img width="800" alt="Image" src="https://github.com/user-attachments/assets/ef5b5545-6a79-4613-8f4c-3ec8c4da6590" />

4. Select OpenID Connect (OIDC) as the protocol and provide a suitable name and an authorized redirect URL.

    - **Name:** Teamspace
    - **Authorized redirect URL:** `http://localhost:3002/api/auth/callback/asgardeo`

  <img width="800" alt="Image" src="https://github.com/user-attachments/assets/a099b0fc-01f3-4f06-9fb2-4fde8bfe9b65" />

!!! Note

    The authorized redirect URL determines where Asgardeo should send users after they successfully log in. Typically, this will be the web address where Teamspace is hosted. For this guide, we'll use `http://localhost:3002/api/auth/callback/asgardeo`, as the app will be accessible at this URL.

5. Allow sharing the application with organizations and click "Create". You can also do this later from the “Advanced” tab of the created application as well.

<img width="800" alt="Image" src="https://github.com/user-attachments/assets/3098f851-4855-4f0a-a98b-00e6a9f3f8ba" />

6. Once you create the application, you will be directed to the Quick Start tab of the created application.

Make a note of the following values from the Protocol and Info tabs of the registered application. You will need them to configure the app in later steps.

- **Client ID** from the Protocol tab.
- **Client Secret** from the Protocol tab.
- **Issuer** from the Info tab.
- **Logout** from the Info tab.

Add the following Allowed Origin:

- `http://localhost:3002`

Add the following post logout URL for the authorized redirect URLs:

- `http://localhost:3002`

Enable app as a public client. Select Access token type as JWT. Click on Update.

## Allow required grant types

To ensure seamless authentication and authorization in the Teamspace application, you must allow the necessary OAuth2 grant types in Asgardeo. These grant types allow your app to authenticate users, retrieve access tokens, and interact with Asgardeo’s APIs securely.

### Required Grant Types for Teamspace

Based on the features we are expecting to implement, the following grant types are enabled:

- **Authorization Code Grant** – Used for user authentication and obtaining access tokens interactively.
- **Client Credentials Grant** – Allows the app to make API calls on behalf of the organization (used for retrieving a root organization token).
- **Organization Switch Grant** – Enables switching between organizations.
- **Refresh Token Grant** - Allows the application to refresh the token.

### How to Enable Grant Types

1. Navigate to your application in the Asgardeo console.
2. Click on the "Protocols" tab.
3. Allow the above grant types and update.

<img width="800" alt="Image" src="https://github.com/user-attachments/assets/462017e2-992c-43d2-82b8-0fc791bedf8a" />

## Create API Resources

Navigate to the API Resources section and click the "New API Resources" button.

### Create the Meeting Service API resource

1. Click the New API Resources.
2. **Identifier:** `http://localhost:9091`
3. **Display Name:** Meeting Service
4. **Permissions:**

    | Scope          | Display name   |
    | -------------- | -------------- |
    | list_meetings  | List Meetings  |
    | create_meeting | Create Meeting |
    | view_meeting   | View Meeting   |
    | update_meeting | Update Meeting |
    | delete_meeting | Delete Meeting |

### Create the Personalization Service API resource

1. **Identifier:** `http://localhost:9093`
2. **Display Name:** Personalization Service
3. **Permissions:**

    | Scope            | Display name     |
    | ---------------- | ---------------- |
    | create_branding  | Create Branding  |
    | update_branding  | Update Branding  |
    | delete_branding  | Delete Branding  |

## Give access to APIs and create roles

Navigate to the application in the Asgardeo console.

1. Click on the "API Authorization" tab.
2. Give access to the following APIs under each section.

### Organization APIs

| API                        | Scopes                                        |
| -------------------------- | --------------------------------------------- |
| SCIM2 Users API            | List User, View User, Create User, Update User, Delete User |
| SCIM2 Roles API            | View Role, Create Role, Update Role, Delete Role |
| SCIM2 Groups API           | View Groups, Create Group, Update Group       |
| Identity Provider Management API | View Identity Provider, Create Identity Provider, Update Identity Provider, Delete Identity Provider |
| Application Management API | Update Application, View Application          |
| Claim Management API       | View Claim, Update Claim                      |
| Branding Preference Management API | Update Branding Preference            |
| Organization Management API | Create Organization, View Organization, Update Organizations, Delete Organizations |
| Userstore Management API   | View Userstore                                |

### Management APIs

| API                        | Scopes                                        |
| -------------------------- | --------------------------------------------- |
| Organization Management API | Create Organization, View Organization, Update Organizations, Delete Organizations |

### Business APIs

| API                        | Scopes                                        |
| -------------------------- | --------------------------------------------- |
| Meeting Service            | View Meeting, List Meetings, Create Meetings, Update meeting, Delete Meeting |
| Personalization Service    | Create Branding, Update Branding, Delete Branding |

## Create Roles

Navigate to the Roles section under User Management and create 2 application roles for teamspace admin and user with the following details.

### Role name: teamspace-admin

| API Resource               | Scopes                                        |
| -------------------------- | --------------------------------------------- |
| SCIM2 Users API            | All Scope                                     |
| SCIM2 Roles API            | All Scope                                     |
| SCIM2 Groups API           | All Scope                                     |
| Identity Provider Management API | All Scope                              |
| Application Management API | All Scope                                     |
| Claim Management API       | All Scope                                     |
| Branding Preference Management API | All Scope                            |
| Meeting Service            | List Meetings, View Meeting, Create Meetings, Update Meeting, Delete Meeting |
| Personalization Service    | Create Branding, Update Branding, Delete Branding |

### Role name: teamspace-user

| API Resource               | Scopes                                        |
| -------------------------- | --------------------------------------------- |
| Meeting Service            | List Meetings, View Meeting, Create Meetings, Update Meeting, Delete Meeting |

## Configure Next.js app

Navigate to `<PROJECT_HOME>/b2b/web-app`.

### Setup Environment Variables

Now using the information available in the Quick Start tab of the application you created in Asgardeo, let’s copy the Client ID and Client Secret and include them in the `.env` (or `.env.local`) file as follows. As the name implies, Client Secret is a secret and should always be kept as an environment variable or using any other secure storage mechanism.

Fill the other values that match your configurations. Our final `.env.local` file will look something like this:

```env
NEXTAUTH_URL=http://localhost:3002
BASE_URL=https://api.asgardeo.io
BASE_ORG_URL=https://api.asgardeo.io/t/{ORG_NAME}
MEETING_SERVICE_URL=http://localhost:9091
PERSONALIZATION_SERVICE_URL=http://localhost:9093
HOSTED_URL=http://localhost:3002
SHARED_APP_NAME="Teamspace"
CLIENT_ID={CLIENT_ID}
CLIENT_SECRET={CLIENT_SECRET}
ADMIN_ROLE_NAME=teamspace-admin
NODE_TLS_REJECT_UNAUTHORIZED=0
```

### Start the application

From `<PROJECT_HOME>/b2b/web-app`:

```bash
npm install
npx nx serve business-admin-app
```

## Configure Asgardeo

### Configure Branding in the root organization

In the root organization, navigate to the Styles & Text section under the Branding section. Set the following properties.

1. Navigate to Design Tab, expand the Images and add the following URL as the Logo URL:

    - `https://cdn.statically.io/gh/wso2con/2025-BCN-iam-tutorial/main/b2b/web-app/libs/business-admin-app/ui/ui-assets/src/lib/images/teamspace_logo.png`

2. Add the Logo Alt Text as Teamspace App Logo.
3. Add the Favicon URL as:

    - `https://cdn.statically.io/gh/wso2con/2025-BCN-iam-tutorial/main/b2b/web-app/libs/business-admin-app/ui/ui-assets/src/lib/images/teamspace_favicon.png`

4. Expand the Color Palette and add `#69a2f4` as the Primary Color.

### Customize email templates

Navigate to the root organization's email templates section.

1. Select Request New User Password.
2. Search for `{{account.recovery.endpoint-url}}/confirmrecovery.do?confirmation={{confirmation-code}}&amp;userstoredomain={{userstore-domain}}&amp;username={{url:user-name}}&amp;type=invite`.
3. Append the following params to the URL `sp=Teamspace&orgid={{organization-id}}` (NOTE: Need to add the created application name).

### Configure the first Organization

1. Create a sub-organization named WorkLink from the Organizations section and switch to the sub-organization.
2. Add a new user. You can use ‘admin@worklink.com’ as the username of the user.
3. You have the following options when setting up the password:
    - Invite the user to set their own password. User will get the navigation to the sample application when you have completed the customize email templates step.
    - Set a password for the user.
4. Add the user to the teamspace-admin role.

### Configure the login flow

1. Navigate to WSO2 Identity Server Console of the primary organization.
2. Remove the Basic Authentication option and keep the “Sign In with SSO” option.
3. Click on update.

## Sign up to Teamspace

Let’s look at how the sign-up flow implementation works in the Teamspace app.

<img width="640" alt="Image" src="https://github.com/user-attachments/assets/850c1f66-522e-4d2d-b942-671377b76a98" />

Our sign-up flow uses the self-service approach offered by Asgardeo. This approach empowers organizations to take control of the onboarding process by enabling organizations to create their own organizations and onboard administrators.

!!! Note

    [Self-Service Approach](https://wso2.com/asgardeo/docs/guides/organization-management/onboard-org-admins/self-service-approach/#maintain-organization-admins)

Visit Teamspace at `https://localhost:3002` and click “Sign Up”.

Enter the details of the user and the organization and sign up:

- **Email:** User will log in using this email address.
- **Password:** A password with 8-30 characters, at least one uppercase letter and at least 1 digit.
- **First Name:** First name of the user.
- **Last Name:** Last name of the user.
- **Organization Name:** Name of the Organization to register.

## Consume the Teamspace Application

Visit the sample application at `http://localhost:3002`.

1. Click on Get Started to get started.
2. You will get a Sign In prompt. Click on the Sign In With SSO at the bottom of the menu.
3. Provide the WorkLink as the Name of the Organization and click Submit.
4. Use admin user credentials (`admin@worklink.com`) created to login to the application.

## Consume the Teamspace Application from Organization URL

Visit the sample application at `http://localhost:3002/?orgId=<org-id>`. Replace `<org-id>` with the organization id retrieved from the console.

1. Click on the Get Started to get started.
2. You will get a Sign In prompt and click on the Sign In With SSO at the bottom of the menu.
3. Provide the WorkLink as the Name of the Organization and click Submit.
4. Use admin user credentials (`admin@worklink.com`) created to login to the application.
