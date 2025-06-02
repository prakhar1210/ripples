A comprehensive Node.js/Express backend API for a survey platform with authentication, survey management, response collection, and analytics.

## Features

- **Authentication**: JWT-based user registration and login
- **Survey Management**: Create, update, publish, and delete surveys
- **Question Types**: Support for text, textarea, radio, checkbox, select, rating, and date questions
- **Response Collection**: Collect and store survey responses with validation
- **Analytics**: Comprehensive analytics and reporting for survey responses
- **Security**: Rate limiting, input validation, and secure password hashing
- **Database**: PostgreSQL with Sequelize ORM

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **Security**: Helmet, bcryptjs, rate limiting
- **Environment**: dotenv

- ## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

-  Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```
The API will be available at `http://localhost:3001`

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Survey Endpoints

#### Get All Surveys (User's)
```http
GET /api/surveys
Authorization: Bearer <token>
```

#### Get Single Survey
```http
GET /api/surveys/:id
Authorization: Bearer <token> (optional)
```

#### Create Survey
```http
POST /api/surveys
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Customer Satisfaction Survey",
  "description": "Help us improve our service",
  "questions": [
    {
      "text": "How satisfied are you?",
      "type": "rating",
      "required": true,
      "options": ["1", "2", "3", "4", "5"]
    },
    {
      "text": "What can we improve?",
      "type": "textarea",
      "required": false
    }
  ],
  "settings": {
    "allowAnonymous": true,
    "requireLogin": false,
    "multipleResponses": false,
    "showResults": false
  }
}
```

#### Update Survey
```http
PUT /api/surveys/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Survey Title",
  "description": "Updated description",
  "questions": [...],
  "settings": {...}
}
```

#### Publish/Unpublish Survey
```http
PATCH /api/surveys/:id/publish
Authorization: Bearer <token>
Content-Type: application/json

{
  "isPublished": true
}
```

#### Delete Survey
```http
DELETE /api/surveys/:id
Authorization: Bearer <token>
```

### Response Endpoints

#### Submit Survey Response
```http
POST /api/responses
Content-Type: application/json

{
  "surveyId": "uuid-here",
  "answers": {
    "question-id-1": "My answer",
    "question-id-2": ["Option 1", "Option 2"]
  },
  "respondent": {
    "email": "respondent@example.com",
    "name": "Respondent Name",
    "metadata": {}
  }
}
```

#### Get Survey Responses
```http
GET /api/responses/survey/:surveyId
Authorization: Bearer <token>
```

### Analytics Endpoints

#### Get Survey Analytics
```http
GET /api/analytics/survey/:id
Authorization: Bearer <token>
```

## Database Schema

### Users
- id (UUID, Primary Key)
- name (String)
- email (String, Unique)
- password (String, Hashed)
- isVerified (Boolean)
- createdAt, updatedAt (Timestamps)

### Surveys
- id (UUID, Primary Key)
- title (String)
- description (Text)
- creatorId (UUID, Foreign Key)
- isPublished (Boolean)
- isActive (Boolean)
- settings (JSONB)
- publishedAt (DateTime)
- expiresAt (DateTime)
- createdAt, updatedAt (Timestamps)

### Questions
- id (UUID, Primary Key)
- surveyId (UUID, Foreign Key)
- text (Text)
- type (Enum: text, textarea, radio, checkbox, select, rating, date)
- options (JSONB Array)
- required (Boolean)
- order (Integer)
- validation (JSONB)
- createdAt, updatedAt (Timestamps)

### Responses
- id (UUID, Primary Key)
- surveyId (UUID, Foreign Key)
- respondentId (UUID, Foreign Key, Nullable)
- answers (JSONB)
- isComplete (Boolean)
- submittedAt (DateTime)
- ipAddress (String)
- userAgent (Text)
- createdAt, updatedAt (Timestamps)

### Respondents
- id (UUID, Primary Key)
- email (String, Nullable)
- name (String, Nullable)
- metadata (JSONB)
- createdAt, updatedAt (Timestamps)
