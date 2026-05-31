# Student Verification Information System (SVIS) API Documentation

Welcome to the SVIS V1 API specifications. All endpoints are prefixed by `/api/v1`.

---

## Authentication Layer

Endpoints related to user registration, session management, and logout.

### 1. Register Staff Account
*   **Method**: `POST`
*   **Endpoint**: `/auth/register`
*   **Access**: Public (or restricted to Admin depending on configuration)
*   **Request Body**:
    ```json
    {
      "staffId": "UNI/ADM/001",
      "fullName": "Dr. Jane Doe",
      "email": "jane.doe@uni.edu",
      "password": "securePassword123",
      "role": "Admin"
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "success": true,
      "message": "Staff user registered successfully",
      "data": {
        "id": "60d0fe2c4f1a4e1790412850",
        "staffId": "UNI/ADM/001",
        "fullName": "Dr. Jane Doe",
        "email": "jane.doe@uni.edu",
        "role": "Admin",
        "status": "active"
      }
    }
    ```

### 2. Login Staff Account
*   **Method**: `POST`
*   **Endpoint**: `/auth/login`
*   **Access**: Public
*   **Request Body**:
    ```json
    {
      "staffId": "UNI/ADM/001",
      "password": "securePassword123"
    }
    ```
*   **Response (200 OK)**:
    *   *Sets an HTTP-Only secure cookie named `refreshToken`*
    ```json
    {
      "success": true,
      "message": "Login successful",
      "data": {
        "user": {
          "id": "60d0fe2c4f1a4e1790412850",
          "staffId": "UNI/ADM/001",
          "fullName": "Dr. Jane Doe",
          "email": "jane.doe@uni.edu",
          "role": "Admin"
        },
        "accessToken": "eyJhbGciOiJIUzI1NiIsIn..."
      }
    }
    ```

### 3. Refresh Access Token
*   **Method**: `POST`
*   **Endpoint**: `/auth/refresh`
*   **Access**: Public (requires the `refreshToken` HTTP-Only cookie)
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Token refreshed successfully",
      "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsIn..."
      }
    }
    ```

### 4. Logout Session
*   **Method**: `POST`
*   **Endpoint**: `/auth/logout`
*   **Access**: Protected
*   **Response (200 OK)**:
    *   *Clears the `refreshToken` HTTP-Only cookie*
    ```json
    {
      "success": true,
      "message": "Logout successful"
    }
    ```

---

## Student Management Layer

Provides endpoints for querying, creating, editing, and deleting student enrollment data.

### 1. Create Student Profile
*   **Method**: `POST`
*   **Endpoint**: `/students`
*   **Access**: Protected (Admin only)
*   **Request Body**:
    ```json
    {
      "matricNumber": "UNI/2026/0001",
      "fullName": "Adaeze Okafor",
      "email": "adaeze@student.edu",
      "phone": "+2348011112222",
      "dob": "2004-06-12",
      "address": "12 Campus Road",
      "photo": "http://localhost:5000/uploads/photo.jpg",
      "faculty": "60d0fe2c4f1a4e1790412800",
      "department": "60d0fe2c4f1a4e1790412801",
      "level": "300",
      "academicSession": "2024/2025"
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "success": true,
      "message": "Student created successfully",
      "data": {
        "id": "60d0fe2c4f1a4e1790412899",
        "matricNumber": "UNI/2026/0001",
        "fullName": "Adaeze Okafor",
        "email": "adaeze@student.edu",
        "status": "active"
      }
    }
    ```

### 2. Query Student Paginated List
*   **Method**: `GET`
*   **Endpoint**: `/students`
*   **Access**: Protected (All Staff roles)
*   **Query Parameters**:
    *   `page`: Page number (default: `1`)
    *   `limit`: Page limit (default: `10`)
    *   `search`: Text match against matric number or name
    *   `sortBy`: Sorting criteria (format: `field:asc|desc`, e.g. `fullName:asc`)
    *   `status`: Filter by status (`active`, `suspended`, `graduated`, `pending`)
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "results": [
          {
            "id": "60d0fe2c4f1a4e1790412899",
            "matricNumber": "UNI/2026/0001",
            "fullName": "Adaeze Okafor",
            "email": "adaeze@student.edu",
            "status": "active",
            "level": "300"
          }
        ],
        "page": 1,
        "limit": 10,
        "totalPages": 1,
        "totalResults": 1
      }
    }
    ```

---

## QR Code Identity System

Manages cryptographic student verification endpoints and key-rotation schemes.

### 1. Generate QR Code ID
*   **Method**: `POST`
*   **Endpoint**: `/qr/generate`
*   **Access**: Protected (Admin only)
*   **Request Body**:
    ```json
    {
      "studentId": "60d0fe2c4f1a4e1790412899"
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "success": true,
      "message": "QR Identity created successfully",
      "data": {
        "verificationId": "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed",
        "qrCodeUrl": "data:image/png;base64,iVBORw0KGgo...",
        "verificationUrl": "http://localhost:5000/api/v1/qr/verify/1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed"
      }
    }
    ```

---

## Verification Checkpoint Engine

Validates check-ins at security posts, libraries, or lecture portals.

### 1. Verify Student
*   **Method**: `POST`
*   **Endpoint**: `/verify`
*   **Access**: Protected (All Staff roles)
*   **Request Body**:
    ```json
    {
      "method": "matric",
      "identifier": "UNI/2026/0001",
      "location": "Main Library Gate"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Student verified successfully",
      "data": {
        "verified": true,
        "student": {
          "id": "60d0fe2c4f1a4e1790412899",
          "matricNumber": "UNI/2026/0001",
          "fullName": "Adaeze Okafor",
          "photo": "http://localhost:5000/uploads/photo.jpg",
          "status": "active"
        }
      }
    }
    ```

---

## Verification Logs & Reporting

Supports query filters, audit details, and double-quoted CSV output sheets.

### 1. Query Logs
*   **Method**: `GET`
*   **Endpoint**: `/logs`
*   **Access**: Protected (All Staff roles)
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "results": [
          {
            "id": "60d0fe2c4f1a4e1790412999",
            "matricNumber": "UNI/2026/0001",
            "type": "Matric",
            "location": "Main Library Gate",
            "status": "verified",
            "createdAt": "2026-05-31T12:23:44.000Z",
            "student": { "fullName": "Adaeze Okafor" },
            "staff": { "fullName": "Test Officer Staff" }
          }
        ],
        "page": 1,
        "limit": 10,
        "totalPages": 1,
        "totalResults": 1
      }
    }
    ```

---

## Dashboard Analytics

Supplies metrics for real-time visualization graphs.

### 1. Retrieve Analytics
*   **Method**: `GET`
*   **Endpoint**: `/analytics`
*   **Access**: Protected (All Staff roles)
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "summary": {
          "totalStudents": 24318,
          "activeStudents": 22140,
          "pendingStudents": 86,
          "totalVerifications": 84120,
          "verificationsToday": 1213,
          "verificationsThisMonth": 25410
        },
        "trends": [
          { "_id": "2026-05-30", "verified": 842, "failed": 12 },
          { "_id": "2026-05-31", "verified": 912, "failed": 8 }
        ],
        "byMethod": [
          { "_id": "QR Scan", "value": 41200 },
          { "_id": "Matric", "value": 31200 }
        ]
      }
    }
    ```
