# App Documentation

This documentation provides a comprehensive overview of the frontend application, including its features, installation, usage and backend / API documentation.

## Table of Contents

- [Installation](#installation)
- [Environment](#environment)
- [Features](#features)
- [Pages](#pages)
  - [Authentication](#authentication)
    - [Register](#register)
    - [Login](#login)
    - [Forgot Password](#forgot-password)
  - [User Dashboard](#user-dashboard)
    - [1.1. Profile Page](#11-profile-page)
    - [1.2. Edit Avatar and Name](#12-edit-avatar-and-name)
    - [1.3. Edit Avatar and Name Confirmation](#13-edit-avatar-and-name-confirmation)
    - [1.4. Change Email](#14-change-email)
    - [1.5. Change Email Confirmation](#15-change-email-confirmation)
    - [1.6. Change Email Verify Received](#16-change-email-verify-received)
    - [1.7. Change Email Success](#17-change-email-success)
    - [2.1. Change Password](#21-change-password)
    - [2.2. Change Password Confirmation](#22-change-password-confirmation)
    - [2.3. Verify Password Change Received](#23-verify-password-change-received)
    - [2.4. Verify New Password Success](#24-verify-new-password-success)
    - [3.1. Delete Account](#31-delete-account)
    - [3.2. Delete Account Confirmation](#32-delete-account-confirmation)
- [API Documentation](#api-documentation)

## Installation

```bash
# Clone the repository
git clone https://github.com/faukirijatul/express-nextjs-ts-authsystem.git

# Navigate to server directory
cd server

# Install dependencies
npm install

# Start the development server
npm run dev

# Navigate to root directory
cd ..

# Navigate to client directory
cd server

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Environment

### Server Environment

```bash
DATABASE_URL=
PORT =
APP_NAME =

NODE_ENV =
CLIENT_URL =

REGISTER_TOKEN_SECRET =
NEW_EMAIL_TOKEN_SECRET =
UPDATE_PASSWORD_TOKEN_SECRET =
FORGOT_PASSWORD_TOKEN_SECRET =
ACCESS_TOKEN_SECRET =
REFRESH_TOKEN_SECRET =

# Cloudinary
CLOUDINARY_CLOUD_NAME =
CLOUDINARY_API_KEY =
CLOUDINARY_API_SECRET =

# Mailing
SMTP_HOST =
SMTP_PORT =
SMTP_SERVICE =
SMTP_MAIL =
SMTP_PASSWORD =
```

### Client Environment

```bash
NEXT_PUBLIC_APP_NAME =
NEXT_PUBLIC_SERVER_URL =

# Google
GOOGLE_CLIENT_ID =
GOOGLE_CLIENT_SECRET =
SECRET =

NEXTAUTH_URL=
```

## Features

- User authentication (login, register, forgot password, email verification)
- User profile management
- Account settings (update profile, change password, delete account)

## Pages

### Authentication

### Register

#### 1. Register

![Register with name, email and password](images/register/register-with-credentials.png)
Features include:

- Form validation for all fields
- OAuth integration with Google

#### 2. Verify email registration

![Verify email registration](images/register/verify-email-register.png)

#### 3. Email registration received

![Email registration received](images/register/email-registration-received.png)

#### 4. Registration Email Verify Failed

![Registration Email Verify Failed](images/register/registration-email-verify-failed.png)

#### 4. Registration Email Verify Success

![Registration Email Verify Success](images/register/registration-email-verify-success.png)

### Login

![Login Page](images/login/login-page.png)

The login page allows users to authenticate using their email and password. Features include:

- Email and password validation
- Password reset option
- OAuth integration with Google

### Forgot Password

#### 1. Forgot Password Page

![Forgot Password Page](images/forgot-password/forgot-password-page.png)

Features include:

- Email validation

#### 2. Forgot Password Email Sent

![Forgot Password Email Sent](images/forgot-password/reset-password-email-sent.png)

#### 3. Forgot Password Email Received

![Forgot Password Email Received](images/forgot-password/forgot-password-email-received.png)

#### 4. Set New Password

![Set New Password](images/forgot-password/set-new-password.png)

#### 5. Reset Password Success

![Reset Password Success](images/forgot-password/reset-password-success.png)

### User Dashboard

#### 1.1. Profile Page

![1.1. Profile](images/profile/profile-page.png)

#### 1.2. Edit Avatar and Name

![1.2. Edit Avatar and Name](images/profile/edit-avatar-and-name.png)

#### 1.3. Edit Avatar and Name Confirmation

![1.3. Edit Avatar and Name Confirmation](images/profile/edit-avatar-and-name-confirmation.png)

#### 1.4. Change Email

![1.4. Change Email](images/profile/change-email.png)

#### 1.5. Change Email Confirmation

![1.5. Change Email Confirmation](images/profile/change-email-confirmation.png)

#### 1.6. Change Email Verify Received

![1.6. Change Email Verify Received](images/profile/change-email-verify-received.png)

#### 1.7. Change Email Success

![1.7. Change Email Success](images/profile/change-email-success.png)

#### 2.1. Change Password

![2.1. Change Password](images/profile/change-password.png)

#### 2.2. Change Password Confirmation

![2.2. Change Password Confirmation](images/profile/change-password-confirmation.png)

#### 2.3. Verify Password Change Received

![2.3. Verify Password Change Received](images/profile/verify-password-change-received.png)

#### 2.4. Verify New Password Success

![2.4. Verify New Password Success](images/profile/verify-new-password-success.png)

#### 3.1. Delete Account

![3.1. Delete Account](images/profile/delete-account.png)

#### 3.2. Delete Account Confirmation

![3.2. Delete Account Confirmation](images/profile/delete-account-confirmation.png)

## API Documentation

The frontend integrates with the backend API:

- [Users API Specification](server/docs/users.md)
