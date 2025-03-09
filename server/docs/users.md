# Users API Specification

## 1. Register

POST /api/users/register

Request Body :

```json
{
  "name": "Fauki Rijatul",
  "email": "faukiofficial@gmail.com",
  "password": "Testpassword1"
}
```

Response Body Success :

```json
{
  "success": true,
  "message": "User registered and email sent",
  "user": {
    "id": "5f3009ae-062c-4da7-b338-10a188acc70a",
    "name": "Fauki Rijatul",
    "email": "faukiofficial@gmail.com",
    "role": "USER",
    "is_active": false
  }
}
```

Response Body Error Example :

```json
{
  "success": false,
  "message": "Email already exists",
  "type": "CONFLICT_ERROR"
}
```

## 2. Resend Token for Email Verification

POST /api/users/resend-token

Request Body :

```json
{
  "email": "faukiofficial@gmail.com"
}
```

Response Success :

```json
{
  "success": true,
  "message": "Email sent",
  "user": {
    "id": "5f3009ae-062c-4da7-b338-10a188acc70a",
    "name": "Fauki Rijatul",
    "email": "faukiofficial@gmail.com",
    "password": null,
    "role": "USER",
    "is_active": false,
    "createdAt": "2025-03-09T04:09:12.289Z",
    "updatedAt": "2025-03-09T04:09:12.289Z"
  }
}
```

Response Body Error Example :

```json
{
  "success": false,
  "message": "Validation failed",
  "type": "VALIDATION_ERROR",
  "errors": [
    {
      "validation": "email",
      "code": "invalid_string",
      "message": "Invalid email format",
      "path": ["email"]
    }
  ]
}
```

## 3. Verify Email

POST /api/users/verify-email

Request Body :

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZjMwMDlhZS0wNjJjLTRkYTctYjMzOC0xMGExODhhY2M3MGEiLCJpYXQiOjE3NDE0OTMzNTIsImV4cCI6MTc0MTU3OTc1Mn0.J2poWCWp-L5-mAgBAtH_G_KDt4USzNoC6avi9G244G4"
}
```

Response Body Success :

```json
{
  "success": true,
  "message": "Email verified",
  "user": {
    "id": "cfdcd639-f1af-47bb-9dde-a66d889eba13",
    "name": "Fauki Rijatul",
    "email": "faukiofficial@gmail.com",
    "role": "USER",
    "is_active": true,
    "createdAt": "2025-03-09T04:12:05.527Z",
    "updatedAt": "2025-03-09T04:14:16.460Z"
  }
}
```

Response Body Error Example:

```json
{
  "success": false,
  "message": "Invalid token",
  "type": "AUTHENTICATION_ERROR"
}
```

## 4. Login With Email and Password

POST /api/users/login

Request Body:

```json
{
  "email": "faukiofficial@gmail.com",
  "password": "Testpassword1"
}
```

Response Body Success:

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "cfdcd639-f1af-47bb-9dde-a66d889eba13",
    "name": "Fauki Rijatul",
    "email": "faukiofficial@gmail.com",
    "password": null,
    "role": "USER",
    "is_active": true,
    "createdAt": "2025-03-09T04:12:05.527Z",
    "updatedAt": "2025-03-09T04:15:08.596Z",
    "image": null
  }
}
```

Response Body Error Example:

```json
{
  "success": false,
  "message": "Username or password incorrect",
  "type": "AUTHENTICATION_ERROR"
}
```

## 5. Login With Google Account

POST /

Request Body:

```json
{
  "email": "faukiofficial@gmail.com",
  "name": "Fauki Rijatul H",
  "picture": "https://www.example.id/news/wp-content/uploads/example.jpg"
}
```

Response Body Success:

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "6d61eb06-8673-40e8-b9fd-ccb3f7557958",
    "name": "Fauki Rijatul H",
    "email": "faukiofficial@gmail.com",
    "password": null,
    "role": "USER",
    "is_active": true,
    "createdAt": "2025-03-09T04:19:49.000Z",
    "updatedAt": "2025-03-09T04:19:49.000Z",
    "image": {
      "id": "73d25a0c-3967-4488-95a7-754db8ce1151",
      "url": "https://www.example.id/news/wp-content/uploads/example.jpg",
      "public_id": null
    }
  }
}
```

Response Body Error Example:

```json
{
  "success": false,
  "message": "Validation failed",
  "type": "VALIDATION_ERROR",
  "errors": [
    {
      "validation": "email",
      "code": "invalid_string",
      "message": "Invalid email format",
      "path": ["email"]
    }
  ]
}
```

## 6. Get Logged In User Info

GET /api/users/me

### Hearders:

- withCredentials: true

Response Body Success:

```json
{
  "success": true,
  "message": "User logged in",
  "user": {
    "id": "6d61eb06-8673-40e8-b9fd-ccb3f7557958",
    "name": "Fauki Rijatul H",
    "email": "faukiofficial@gmail.com",
    "role": "USER",
    "image": {
      "id": "73d25a0c-3967-4488-95a7-754db8ce1151",
      "url": "https://www.example.id/news/wp-content/uploads/example.jpg",
      "public_id": null
    },
    "is_active": true,
    "createdAt": "2025-03-09T04:19:49.000Z",
    "updatedAt": "2025-03-09T04:19:49.000Z"
  }
}
```

Response Body Error Example:

```json
{
  "success": false,
  "message": "Unauthorized",
  "type": "AUTHENTICATION_ERROR"
}
```

## 7. Update User

PATCH /api/users/update-user

### Hearders:

- withCredentials: true

Request Body (form-data):

```json
{
    "name": "Fauki Rijatul Edited",
    "email": "faukirijatulnew@gmail.com",
    "image": fileData
}
```

- All Is Optional
- You will receive token in your email to verify your new email

Response Body Success If Name, Email, adn Email Updated:

```json
{
  "success": true,
  "message": "Complete your email change, check your email inbox",
  "user": {
    "id": "51625d82-6687-4927-b206-988dc29f9d91",
    "name": "Fauki Rijatul Edited",
    "email": "faukiofficial@gmail.com",
    "password": null,
    "role": "USER",
    "is_active": true,
    "createdAt": "2025-03-09T04:25:16.369Z",
    "updatedAt": "2025-03-09T04:33:51.186Z",
    "image": {
      "id": "f7863178-6602-42ba-baa7-150f1c706dc5",
      "url": "https://res.cloudinary.com/dzivoyax7/image/upload/v1741494830/images/profile/vrwcub6mpspnnfmlz2cd.jp",
      "public_id": "images/profile/vrwcub6mpspnnfmlz2cd"
    }
  }
}
```

Response Body Error Example:

```json
{
  "success": false,
  "message": "Failed to send email",
  "type": "SERVER_ERROR"
}
```

## 8. Verify New Email

POST /api/users/verify-new-email

Request Body:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MTYyNWQ4Mi02Njg3LTQ5MjctYjIwNi05ODhkYzI5ZjlkOTEiLCJuZXdFbWFpbCI6ImZhdWtpcmlqYXR1bG5ld0BnbWFpbC5jb20iLCJpYXQiOjE3NDE0OTQ4MzEsImV4cCI6MTc0MTU4MTIzMX0.9g69sXgN3vcozOtq8l8EbQrQru3yaqGfdoBJ7dLk2ps"
}
```

Response Body Success:

```json
{
  "success": true,
  "message": "Email updated",
  "user": {
    "id": "51625d82-6687-4927-b206-988dc29f9d91",
    "name": "Fauki Rijatul Edited",
    "email": "faukirijatulnew@gmail.com",
    "password": null,
    "role": "USER",
    "is_active": true,
    "createdAt": "2025-03-09T04:25:16.369Z",
    "updatedAt": "2025-03-09T04:39:12.918Z",
    "image": {
      "id": "4c9cfbde-4d70-474d-9bab-b45f2a160f16",
      "url": "https://res.cloudinary.com/dzivoyax7/image/upload/v1741494991/images/profile/zlpaz1najwoha1aik5pg.jp",
      "public_id": "images/profile/zlpaz1najwoha1aik5pg"
    }
  }
}
```

Response Body Error Example:

```json
{
  "success": false,
  "message": "Invalid token",
  "type": "AUTHENTICATION_ERROR"
}
```

## 9. Update Password

POST /api/users/update-password

### Hearders:

- withCredentials: true

Request Body:

```json
{
  "password": "Testpassword1",
  "newPassword": "Testpassword2"
}
```

Response Body Success:

```json
{
  "success": true,
  "message": "Complete your password change, check your email inbox"
}
```

Response Body Failed Example:

```json
{
  "success": false,
  "message": "Validation failed",
  "type": "VALIDATION_ERROR",
  "errors": [
    {
      "validation": "regex",
      "code": "invalid_string",
      "message": "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      "path": ["password"]
    }
  ]
}
```

## 10. Verify New Password

POST //api/users/verify-new-password

Request Body:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MTYyNWQ4Mi02Njg3LTQ5MjctYjIwNi05ODhkYzI5ZjlkOTEiLCJuZXdQYXNzd29yZCI6IiQyYiQxMCRjcmJDMjBYWWI0bFI5RWtVd3JYcllPNWFwVzFsT2FLL1FtbWlSOGFrdDFZSTN5MGN1MVV0dSIsImlhdCI6MTc0MTQ5NTM2MywiZXhwIjoxNzQxNTgxNzYzfQ.uR1lPC81Q9jMqS8PbISAZhYt0HJzhqsm3BB0e_GHQfo"
}
```

Response Body Success:

```json
{
  "success": true,
  "message": "Password updated"
}
```

Response Body Error Example:

```json
{
  "success": false,
  "message": "Invalid token",
  "type": "AUTHENTICATION_ERROR"
}
```

## 11. Forgot Password

Request Body:

```json
{
  "email": "faukirijatulnew@gmail.com"
}
```

Response Body Success:

```json
{
  "success": true,
  "message": "Complete your password reset, check your email inbox"
}
```

Response Body Error Example:

```json
{
  "success": false,
  "message": "Unauthorized",
  "type": "AUTHENTICATION_ERROR"
}
```

## 12. Verify Reset Password

POST /api/users/reset-password-verify

Request Body:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkYTQ2ZDM5Ni0wNjQ4LTRhYzUtOWIyMS1mNjU1YWExZjEyNDYiLCJpYXQiOjE3NDE0MjYzMjUsImV4cCI6MTc0MTUxMjcyNX0.GbCs9K_Xu0RICEZBKAoBoZdg-rnI4U3z2li2Lh8RUYA",
  "newPassword": "Testpassword1"
}
```

Response Body Success:

```json
{
  "success": true,
  "message": "Password updated"
}
```

Response Body Error Example:

```json
{
  "success": false,
  "message": "Invalid token",
  "type": "AUTHENTICATION_ERROR"
}
```

## 13. Logout

DELETE /api/users/logout

### Headers:

- withCredentials: true

Response Body Success:

```json
{
  "success": true,
  "message": "Logout success"
}
```

Response Body Error Example:

```json
{
  "success": false,
  "message": "Unauthorized",
  "type": "AUTHENTICATION_ERROR"
}
```

## 14. Delete Account

DELETE /api/users/delete-account

### Headers:

- withCredentials: true

Response Body Success:

```json
{
  "success": true,
  "message": "Account deleted"
}
```

Response Body Error Example:

```json
{
  "success": false,
  "message": "Unauthorized",
  "type": "AUTHENTICATION_ERROR"
}
```
