# Scope Media Platform - API Documentation

## 🔌 API Overview

The Scope Media Platform provides a RESTful API built with Next.js API routes and Supabase backend. All endpoints return JSON responses and support standard HTTP methods.

### Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

### Authentication
- **Public Endpoints**: No authentication required
- **User Endpoints**: Supabase JWT token required
- **Admin Endpoints**: Service role key required

### Response Format
```typescript
// Success Response
{
  "data": any,
  "success": true
}

// Error Response
{
  "error": "Error message",
  "success": false,
  "status": 400
}
```

---

## 📡 API Endpoints

### 1. Streams API (`/api/streams`)

Manages live streaming content.

#### GET /api/streams
Fetch all streams ordered by creation date.

**Request:**
```http
GET /api/streams
```

**Response:**
```typescript
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Live Gaming Stream",
    "url": "rtmp://live.example.com/live/stream1",
    "status": "active",
    "thumbnail": "https://example.com/thumbnails/stream1.jpg",
    "viewers": 150,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

**Status Codes:**
- `200` - Success
- `500` - Server error

#### POST /api/streams
Add a new live stream.

**Request:**
```http
POST /api/streams
Content-Type: application/json

{
  "title": "New Gaming Stream",
  "url": "rtmp://live.example.com/live/stream2",
  "status": "active",
  "thumbnail": "https://example.com/thumbnails/stream2.jpg",
  "viewers": 0
}
```

**Response:**
```typescript
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "New Gaming Stream",
  "url": "rtmp://live.example.com/live/stream2",
  "status": "active",
  "thumbnail": "https://example.com/thumbnails/stream2.jpg",
  "viewers": 0,
  "created_at": "2024-01-15T11:00:00Z",
  "updated_at": "2024-01-15T11:00:00Z"
}
```

**Status Codes:**
- `201` - Created
- `400` - Bad request
- `500` - Server error

#### DELETE /api/streams
Delete a stream by ID.

**Request:**
```http
DELETE /api/streams?id=550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```typescript
{
  "success": true
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad request (missing ID)
- `500` - Server error

---

### 2. Videos API (`/api/videos`)

Manages archived video content.

#### GET /api/videos
Fetch all archived videos ordered by upload date.

**Request:**
```http
GET /api/videos
```

**Response:**
```typescript
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "title": "Tutorial: React Basics",
    "url": "https://youtube.com/watch?v=dQw4w9WgXcQ",
    "duration": "1:30:00",
    "upload_date": "2024-01-14T15:45:00Z",
    "custom_title": "Programming Tutorials",
    "thumbnail": "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    "created_at": "2024-01-14T15:45:00Z",
    "updated_at": "2024-01-14T15:45:00Z"
  }
]
```

**Status Codes:**
- `200` - Success
- `500` - Server error

#### POST /api/videos
Add a new archived video.

**Request:**
```http
POST /api/videos
Content-Type: application/json

{
  "title": "Advanced React Patterns",
  "url": "https://youtube.com/watch?v=example123",
  "duration": "2:15:30",
  "custom_title": "Programming Tutorials",
  "thumbnail": "https://img.youtube.com/vi/example123/hqdefault.jpg"
}
```

**Response:**
```typescript
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "title": "Advanced React Patterns",
  "url": "https://youtube.com/watch?v=example123",
  "duration": "2:15:30",
  "upload_date": "2024-01-15T12:00:00Z",
  "custom_title": "Programming Tutorials",
  "thumbnail": "https://img.youtube.com/vi/example123/hqdefault.jpg",
  "created_at": "2024-01-15T12:00:00Z",
  "updated_at": "2024-01-15T12:00:00Z"
}
```

**Status Codes:**
- `201` - Created
- `400` - Bad request
- `500` - Server error

#### DELETE /api/videos
Delete a video by ID.

**Request:**
```http
DELETE /api/videos?id=550e8400-e29b-41d4-a716-446655440002
```

**Response:**
```typescript
{
  "success": true
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad request (missing ID)
- `500` - Server error

---

### 3. Titles API (`/api/titles`)

Manages custom categories for content organization.

#### GET /api/titles
Fetch all custom titles/categories.

**Request:**
```http
GET /api/titles
```

**Response:**
```typescript
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "title": "Programming Tutorials",
    "created_at": "2024-01-10T09:00:00Z",
    "updated_at": "2024-01-10T09:00:00Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440005",
    "title": "Gaming Content",
    "created_at": "2024-01-10T09:15:00Z",
    "updated_at": "2024-01-10T09:15:00Z"
  }
]
```

**Status Codes:**
- `200` - Success
- `500` - Server error

#### POST /api/titles
Add a new custom title/category.

**Request:**
```http
POST /api/titles
Content-Type: application/json

{
  "title": "Music Videos"
}
```

**Response:**
```typescript
{
  "id": "550e8400-e29b-41d4-a716-446655440006",
  "title": "Music Videos",
  "created_at": "2024-01-15T13:00:00Z",
  "updated_at": "2024-01-15T13:00:00Z"
}
```

**Status Codes:**
- `201` - Created
- `400` - Bad request
- `409` - Conflict (title already exists)
- `500` - Server error

#### DELETE /api/titles
Delete a custom title by name.

**Request:**
```http
DELETE /api/titles?title=Music%20Videos
```

**Response:**
```typescript
{
  "success": true
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad request (missing title)
- `404` - Not found
- `500` - Server error

---

### 4. Users API (`/api/users`)

Manages user profiles and authentication.

#### GET /api/users
Fetch all user profiles.

**Request:**
```http
GET /api/users
Authorization: Bearer <service_role_key>
```

**Response:**
```typescript
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440007",
    "email": "user@example.com",
    "full_name": "John Doe",
    "avatar_url": "https://example.com/avatars/user1.jpg",
    "subscription_plan": "premium",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
]
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `500` - Server error

#### POST /api/users
Update user profile.

**Request:**
```http
POST /api/users
Content-Type: application/json
Authorization: Bearer <service_role_key>

{
  "userId": "550e8400-e29b-41d4-a716-446655440007",
  "email": "newemail@example.com",
  "full_name": "John Smith",
  "subscription_plan": "enterprise"
}
```

**Response:**
```typescript
{
  "id": "550e8400-e29b-41d4-a716-446655440007",
  "email": "newemail@example.com",
  "full_name": "John Smith",
  "avatar_url": "https://example.com/avatars/user1.jpg",
  "subscription_plan": "enterprise",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T14:00:00Z"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad request
- `401` - Unauthorized
- `404` - User not found
- `500` - Server error

---

### 5. User Library API (`/api/user-library`)

Manages user's personal content library.

#### GET /api/user-library
Fetch user's library items.

**Request:**
```http
GET /api/user-library?userId=550e8400-e29b-41d4-a716-446655440007
Authorization: Bearer <jwt_token>
```

**Response:**
```typescript
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440008",
    "user_id": "550e8400-e29b-41d4-a716-446655440007",
    "title": "My Favorite Video",
    "description": "A great tutorial video",
    "content_type": "video",
    "file_url": "https://example.com/videos/favorite.mp4",
    "thumbnail_url": "https://example.com/thumbnails/favorite.jpg",
    "file_size": 52428800,
    "duration": "1:30:00",
    "tags": ["tutorial", "programming"],
    "is_public": false,
    "uploaded_by_admin": false,
    "admin_uploader_id": null,
    "created_at": "2024-01-12T16:30:00Z",
    "updated_at": "2024-01-12T16:30:00Z"
  }
]
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `500` - Server error

#### POST /api/user-library
Add item to user's library.

**Request:**
```http
POST /api/user-library
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "user_id": "550e8400-e29b-41d4-a716-446655440007",
  "title": "New Library Item",
  "description": "Description of the item",
  "content_type": "video",
  "file_url": "https://example.com/videos/new.mp4",
  "thumbnail_url": "https://example.com/thumbnails/new.jpg",
  "file_size": 31457280,
  "duration": "0:45:30",
  "tags": ["new", "content"],
  "is_public": false
}
```

**Response:**
```typescript
{
  "id": "550e8400-e29b-41d4-a716-446655440009",
  "user_id": "550e8400-e29b-41d4-a716-446655440007",
  "title": "New Library Item",
  "description": "Description of the item",
  "content_type": "video",
  "file_url": "https://example.com/videos/new.mp4",
  "thumbnail_url": "https://example.com/thumbnails/new.jpg",
  "file_size": 31457280,
  "duration": "0:45:30",
  "tags": ["new", "content"],
  "is_public": false,
  "uploaded_by_admin": false,
  "admin_uploader_id": null,
  "created_at": "2024-01-15T15:00:00Z",
  "updated_at": "2024-01-15T15:00:00Z"
}
```

**Status Codes:**
- `201` - Created
- `400` - Bad request
- `401` - Unauthorized
- `500` - Server error

#### DELETE /api/user-library
Delete item from user's library.

**Request:**
```http
DELETE /api/user-library?id=550e8400-e29b-41d4-a716-446655440008
Authorization: Bearer <jwt_token>
```

**Response:**
```typescript
{
  "success": true
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad request (missing ID)
- `401` - Unauthorized
- `403` - Forbidden (not owner)
- `404` - Not found
- `500` - Server error

---

## 🔐 Authentication

### JWT Token Authentication
For user-specific endpoints, include the JWT token in the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

### Service Role Authentication
For admin endpoints, use the service role key:

```http
Authorization: Bearer <service_role_key>
```

### Getting Tokens

#### JWT Token (User)
```typescript
// Frontend - after user login
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;
```

#### Service Role Key
```env
# Environment variable
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## 📊 Error Handling

### Standard Error Response
```typescript
{
  "error": "Error message",
  "success": false,
  "status": 400,
  "details": "Additional error details"
}
```

### Common Error Codes
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

### Error Examples

#### Validation Error
```typescript
{
  "error": "Validation failed",
  "success": false,
  "status": 400,
  "details": "Title is required"
}
```

#### Authentication Error
```typescript
{
  "error": "Unauthorized",
  "success": false,
  "status": 401,
  "details": "Invalid or missing token"
}
```

#### Not Found Error
```typescript
{
  "error": "Resource not found",
  "success": false,
  "status": 404,
  "details": "Stream with ID 'invalid-id' not found"
}
```

---

## 🧪 Testing

### Using cURL

#### Get all streams
```bash
curl -X GET http://localhost:3000/api/streams
```

#### Add new stream
```bash
curl -X POST http://localhost:3000/api/streams \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Stream",
    "url": "rtmp://test.example.com/live",
    "status": "active",
    "thumbnail": "https://example.com/thumb.jpg"
  }'
```

#### Delete stream
```bash
curl -X DELETE "http://localhost:3000/api/streams?id=stream-id"
```

### Using JavaScript/Fetch

#### Get all videos
```javascript
const response = await fetch('/api/videos');
const videos = await response.json();
console.log(videos);
```

#### Add new video
```javascript
const response = await fetch('/api/videos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'New Video',
    url: 'https://youtube.com/watch?v=example',
    duration: '1:30:00',
    custom_title: 'Tutorials',
    thumbnail: 'https://example.com/thumb.jpg'
  })
});

const result = await response.json();
console.log(result);
```

### Using Postman
1. Import the API collection
2. Set base URL to `http://localhost:3000/api`
3. Add authentication headers as needed
4. Test all endpoints

---

## 📈 Rate Limiting

Currently, no rate limiting is implemented. For production deployment, consider implementing:

- Request rate limiting per IP
- API key-based rate limiting
- User-based rate limiting
- Endpoint-specific limits

---

## 🔄 Real-time Updates

The API supports real-time updates through Supabase subscriptions:

```typescript
// Subscribe to streams changes
const subscription = supabase
  .channel('streams-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'streams' },
    (payload) => {
      console.log('Stream changed:', payload);
    }
  )
  .subscribe();
```

---

## 📝 Changelog

### Version 1.0.0
- Initial API release
- CRUD operations for all entities
- Authentication support
- Error handling
- Real-time subscriptions

---

*This API documentation is automatically generated and maintained alongside the codebase.*
