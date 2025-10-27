# Mental Health Calendar Feature

This directory contains the implementation of the Calendar feature for the mental health website. The feature includes:

## Features Implemented

1. **Monthly Calendar View**
   - Visual representation of diary entries
   - Color-coded mood indicators
   - Navigation between months
   - Today highlighting

2. **Daily Diary Tracking**
   - Create diary entries for today
   - Edit entries for the past 2 days
   - Mood selection with emojis
   - Rich text entry content

3. **GitHub-Style Streak Visualization**
   - Activity grid showing daily participation
   - Current streak counter
   - Color-coded activity levels
   - Tooltip information for each day

4. **Daily Inspirational Quotes**
   - Random mental health quotes
   - Quote refresh functionality
   - Author attribution

## Components

### Pages
- `CalendarPage.jsx` - Main calendar view with all integrated features

### Components
- `StreakVisualization.jsx` - GitHub-style activity grid
- `DailyQuote.jsx` - Inspirational quote display with refresh
- `DiaryEntryModal.jsx` - Modal interface for creating/editing diary entries

## Technical Details

### Backend Integration
The calendar feature integrates with several backend services:
- Calendar Service (`/api/calendar/*`)
- Diary Service (`/api/diary/*`)
- Quote Service (`/api/quotes/*`)

### Data Flow
1. Calendar page loads monthly data from backend
2. User interactions trigger API calls to create/update diary entries
3. Streak visualization updates based on diary completion status
4. Daily quotes are fetched and can be refreshed by the user

### State Management
- Local component state for UI interactions
- Axios for API communication
- React Router for navigation

## Future Enhancements
- Enhanced mood tracking with more detailed emotions
- Export functionality for diary entries
- Reminder notifications for daily entries
- Social sharing features (with privacy controls)
- Analytics dashboard for mood trends