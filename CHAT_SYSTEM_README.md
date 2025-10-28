# Anonymous Chat System

## Overview
This is an anonymous chat system with real-time messaging capabilities, content moderation, and user management features. The system allows users to chat anonymously in groups of 2-5 people.

## Features
1. **Anonymous Chatting**: Users can chat without revealing their identity
2. **Content Moderation**: Automatic detection and censorship of:
   - Profanity and offensive language
   - Email addresses and phone numbers
   - Personal identifying information
   - Harmful drug names and substances
3. **Group Chat**: Random matching of 2-5 users per chat room
4. **User Flagging**: Automatic flagging of users who violate community guidelines
5. **Ban System**: Automatic banning of users after 3 violations
6. **Administration**: Dashboard for monitoring flagged and banned users

## Technical Implementation

### Backend
- **Framework**: Flask with Flask-SocketIO
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Real-time Communication**: Polling-based approach (fallback from WebSocket)
- **Content Moderation**: Regex-based filtering system

### Frontend
- **Framework**: React with React Router
- **Real-time Updates**: Polling every 1-2 seconds for messages and status updates
- **UI**: Responsive design with Tailwind CSS

## API Endpoints

### Chat Session Management
- `POST /api/chat/session` - Create a new chat session
- `POST /api/chat/group` - Join or create a chat group
- `POST /api/chat/leave` - Leave the current chat group

### Messaging
- `POST /api/chat/message` - Send a message
- `GET /api/chat/messages/<group_id>?since=<id>` - Get messages since a specific ID
- `GET /api/chat/messages/<group_id>?limit=<count>` - Get recent messages

### User Management
- `GET /api/chat/status/<user_session_id>` - Get user status (banned, in group, etc.)
- `POST /api/chat/moderate` - Moderate content without sending

### Administration
- `GET /api/chat/admin/flagged-users` - Get all flagged users
- `GET /api/chat/admin/banned-users` - Get all banned users
- `POST /api/chat/admin/unban` - Unban a user

## Database Schema

### Chat Groups
- `id` (Primary Key)
- `group_code` (Unique identifier)
- `created_at`
- `max_members` (default: 5)
- `is_active`

### Messages
- `id` (Primary Key)
- `group_id` (Foreign Key)
- `user_session_id` (Anonymous user identifier)
- `username` (Random generated username)
- `content` (Message content)
- `flagged` (Boolean for moderation flags)
- `created_at`

### User Flags
- `id` (Primary Key)
- `user_session_id` (Unique)
- `flag_count`
- `last_flagged_at`
- `is_banned` (Boolean)
- `banned_at`
- `ban_reason`

### Banned Users
- `id` (Primary Key)
- `user_session_id` (Unique)
- `banned_at`
- `reason`
- `banned_by` (Admin identifier)

## Content Moderation Categories
- Profanity and offensive language
- Email addresses and phone numbers
- Personal identifying information
- Harmful drug names and substances
- Spam and malicious content

## Setup Instructions

1. Install backend dependencies:
   ```
   cd backend
   pip install -r requirements.txt
   ```

2. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```

3. Run database migrations:
   ```
   cd backend
   python -m migrations.chat_migration
   ```

4. Start the backend server:
   ```
   cd backend
   python app.py
   ```

5. Start the frontend development server:
   ```
   cd frontend
   npm run dev
   ```

## Usage

1. Navigate to the chat page at `/chat`
2. The system will automatically create a session and look for a chat group
3. When 2-5 users are available, they will be randomly grouped together
4. Users can send messages that will be moderated in real-time
5. Violations will result in automatic flagging and potential banning

## Administration

Administrators can monitor the system through the admin dashboard at `/admin/chat` which shows:
- Flagged users and their violation counts
- Banned users and ban reasons
- Ability to unban users