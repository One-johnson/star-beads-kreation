# School Management System

A comprehensive, modern school management platform built with Next.js, Convex, and ShadCN UI. This system provides role-based access control for administrators, teachers, students, and parents with real-time updates and a mobile-friendly interface.

## 🚀 Features

### Core Functionality
- **Authentication & Role-Based Access Control (RBAC)**
  - Secure login for Admin, Teacher, Student, and Parent roles
  - Session management with automatic role-based redirects
  - Password reset functionality

- **Student Management**
  - Complete student profiles with personal and academic information
  - Student enrollment and class assignment
  - Parent-student linking
  - Medical information tracking

- **Teacher Management**
  - Teacher profiles with qualifications and specializations
  - Class and subject assignments
  - Performance tracking

- **Class & Subject Management**
  - Dynamic class creation with capacity management
  - Subject assignment to classes with scheduling
  - Timetable management with room assignments

- **Attendance Tracking**
  - Real-time attendance marking by teachers
  - Multiple attendance statuses (present, absent, late, excused)
  - Attendance reports and analytics
  - Automatic notifications for low attendance

- **Grade Management**
  - Comprehensive grading system with multiple assessment types
  - Grade calculation and percentage tracking
  - Performance analytics and reports
  - Grade notifications to students and parents

- **Fee Management**
  - Multiple fee types (tuition, transport, library, etc.)
  - Payment tracking and status management
  - Due date reminders and notifications
  - Payment history and reports

- **Communication System**
  - Real-time messaging between users
  - Announcements and notifications
  - Role-based message filtering
  - System notifications for important events

- **Dashboard & Analytics**
  - Role-specific dashboards with relevant information
  - Interactive charts and statistics
  - Real-time data updates
  - Mobile-responsive design

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router)
- **UI Components**: ShadCN UI with Tailwind CSS
- **Backend**: Convex (Database & Serverless Functions)
- **Authentication**: Custom session-based auth with bcrypt
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Notifications**: Sonner toast notifications

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Convex account (free tier available)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd school-management-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Convex
1. Create a new Convex project at [convex.dev](https://convex.dev)
2. Copy your Convex deployment URL
3. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
```

### 4. Run the Development Server
```bash
npm run dev
```

### 5. Seed the Database
Visit `http://localhost:3000/api/seed` to populate the database with sample data.

## 👥 Demo Accounts

After seeding the database, you can use these demo accounts:

### Administrator
- **Email**: admin@school.com
- **Password**: admin123
- **Access**: Full system administration

### Teacher
- **Email**: sarah.johnson@school.com
- **Password**: teacher123
- **Access**: Class management, grading, attendance

### Student
- **Email**: alex.thompson@student.school.com
- **Password**: student123
- **Access**: View grades, attendance, schedule

### Parent
- **Email**: john.thompson@parent.school.com
- **Password**: parent123
- **Access**: Monitor child's progress, fees, communications

## 📱 Role-Based Access

### Administrator
- User management (students, teachers, parents)
- Class and subject management
- System configuration and settings
- Comprehensive reports and analytics
- Fee management and financial oversight

### Teacher
- Class management and student enrollment
- Attendance tracking and marking
- Grade entry and management
- Student communication
- Class schedule management

### Student
- View personal grades and performance
- Check attendance records
- Access class schedule
- Receive notifications and messages
- View academic progress

### Parent
- Monitor child's academic progress
- View attendance records
- Access fee information and payments
- Receive notifications about child's performance
- Communicate with teachers and administrators

## 🏗 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Administrator pages
│   ├── auth/              # Authentication pages
│   ├── student/           # Student pages
│   ├── teacher/           # Teacher pages
│   └── parent/            # Parent pages
├── components/            # Reusable UI components
├── contexts/              # React contexts (Auth)
├── hooks/                 # Custom React hooks
└── lib/                   # Utility functions

convex/
├── schema.ts              # Database schema
├── auth.ts                # Authentication functions
├── authMutations.ts       # User management mutations
├── authNode.ts            # Node.js auth actions
├── school.ts              # Core school management functions
├── messages.ts            # Messaging and notifications
└── seed.ts                # Database seeding
```

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
```

### Database Schema
The system uses a comprehensive schema with the following main tables:
- `users` - User authentication and basic info
- `students` - Student profiles and academic info
- `teachers` - Teacher profiles and qualifications
- `classes` - Class information and capacity
- `subjects` - Subject definitions and credits
- `attendance` - Attendance records
- `grades` - Grade and assessment records
- `fees` - Fee management
- `messages` - Communication system
- `notifications` - System notifications

## 🚀 Deployment

### Vercel Deployment
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Convex Deployment
1. Run `npx convex dev` to start Convex development
2. Run `npx convex deploy` to deploy to production

## 📊 Features in Detail

### Real-time Updates
- All data updates are reflected in real-time across all connected clients
- Live notifications for important events
- Real-time attendance tracking
- Instant grade updates

### Mobile Responsive
- Fully responsive design that works on all devices
- Touch-friendly interface for mobile users
- Optimized layouts for tablets and phones

### Security
- Role-based access control
- Secure password hashing with bcrypt
- Session-based authentication
- Input validation and sanitization

### Performance
- Optimized database queries with proper indexing
- Efficient data loading with pagination
- Cached queries for better performance
- Lazy loading of components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the Convex documentation for backend questions

## 🔮 Roadmap

- [ ] Advanced reporting and analytics
- [ ] Integration with external payment gateways
- [ ] Mobile app development
- [ ] Advanced scheduling with conflict detection
- [ ] Bulk data import/export functionality
- [ ] Advanced notification system
- [ ] Multi-language support
- [ ] Advanced security features (2FA, audit logs)

---

Built with ❤️ using Next.js, Convex, and ShadCN UI
