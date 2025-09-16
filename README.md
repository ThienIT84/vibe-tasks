# Vibe Tasks

A modern task management application built with Next.js 14, TypeScript, and Supabase.

## 🚀 Features

- **Task Management**: Create, edit, delete, and organize tasks
- **Priority System**: Low, Medium, High, and Urgent priorities
- **Status Tracking**: Pending, In Progress, and Done statuses
- **User Profiles**: Manage personal information and avatars
- **Real-time Updates**: Live data synchronization
- **Responsive Design**: Works on desktop and mobile
- **Authentication**: Secure user authentication with Supabase

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons

### Backend
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Database
- **Row Level Security** - Data security
- **Supabase Auth** - Authentication

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/       # Dashboard route group
│   ├── api/               # API routes
│   ├── profile/           # Profile page
│   ├── sign-in/           # Sign in page
│   └── sign-up/           # Sign up page
├── components/            # Reusable components
│   ├── ui/                # UI components
│   └── site/              # Site-specific components
├── lib/                   # Utility functions and hooks
│   ├── hooks.ts           # Custom React hooks
│   ├── constants.ts       # Application constants
│   ├── supabase.ts        # Supabase client
│   ├── task.ts            # Task utilities
│   └── utils.ts           # General utilities
└── types/                 # TypeScript type definitions
    └── task.ts            # Task-related types
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vibe-tasks
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   - Open Supabase Dashboard
   - Go to SQL Editor
   - Run the SQL script from `database-setup.sql`

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  due_date DATE,
  inserted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 Customization

### Adding New Task Statuses
1. Update `TASK_STATUSES` in `src/lib/constants.ts`
2. Update the database schema
3. Update the UI components

### Adding New Priorities
1. Update `TASK_PRIORITIES` in `src/lib/constants.ts`
2. Update `TASK_PRIORITY_COLORS` for styling
3. Update the UI components

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables
4. Deploy!

### Other Platforms
- **Netlify**: Use `npm run build` and deploy the `out` folder
- **Railway**: Connect your GitHub repository
- **DigitalOcean**: Use App Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Check the [Supabase Documentation](https://supabase.com/docs)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Supabase](https://supabase.com/) for the backend services
- [Tailwind CSS](https://tailwindcss.com/) for the styling
- [Radix UI](https://www.radix-ui.com/) for the components
