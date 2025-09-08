
# College Attendance Management Application

This is a web-based attendance management application built with **React** and **Supabase**. It is designed for college faculty members to efficiently track student attendance, view dashboards, manage student rosters, and generate shareable reports. The application uses a mock navigation system and simple inline styles to simulate a clean user interface.

## Features

  * **User Authentication**: Secure faculty login and registration powered by Supabase Auth.
  * **Attendance Entry**: A dedicated interface for teachers to mark daily attendance for specific classes and periods, including morning and afternoon sessions.
  * **Student Roster Management**: Faculty can manage their class rosters by uploading student data via CSV files.
  * **Interactive Dashboard**: Visualize class attendance with dynamic pie charts and bar charts for different date ranges (weekly, monthly, and semester-wise).
  * **Filter & Export**: Filter students by attendance percentage and export the filtered list as a CSV file.
  * **Report Generation**: Generate detailed attendance summaries and daily attendance records.
  * **Sharing Capabilities**: Easily copy attendance summaries to the clipboard or share them directly via WhatsApp.
  * **User Profile**: A dedicated profile screen to view faculty details such as name, employee ID, and department.
  * **Responsive Design**: The UI is designed with flexible layouts to work well on various screen sizes.

##  Technology Stack

  * **Frontend**: React.js
  * **State Management**: React Hooks (`useState`, `useEffect`, `useCallback`, `useMemo`)
  * **Backend & Database**: Supabase (used for Authentication, Database storage for profiles, attendance records, and student rosters).
  * **Styling**: Inline CSS for simplicity and portability.
  * **Charting**: Custom SVG-based components (`PieChart`, `BarChart`) for data visualization.

##  Setup and Installation

### Prerequisites

  * Node.js (LTS version recommended)
  * A Supabase account

### 1\. Clone the repository

Since this is a single-file application, you can save the provided code as `App.js` inside a new React project.

```bash
npx create-react-app my-attendance-app
cd my-attendance-app
# Replace the contents of src/App.js with the provided code
```

### 2\. Install Dependencies

Install the necessary Supabase client library.

```bash
npm install @supabase/supabase-js
```

### 3\. Configure Supabase

1.  Go to your Supabase project dashboard.
2.  Navigate to **Project Settings \> API**.
3.  Copy your `supabaseUrl` and `supabaseAnonKey`.
4.  Replace the placeholder values in the `App.js` file with your own credentials:

<!-- end list -->

```javascript
// Supabase Configuration
const supabaseUrl = 'YOUR_SUPABASE_URL_HERE';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY_HERE';
const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 4\. Database Schema Setup

You need to create three tables in your Supabase database. You can do this easily from the Supabase Studio's SQL Editor.

#### `profiles` Table

```sql
create table public.profiles (
  id uuid not null default gen_random_uuid(),
  full_name text,
  employee_id text,
  department text,
  role text,
  constraint profiles_pkey primary key (id)
);
```

#### `attendance_records` Table

```sql
create table public.attendance_records (
  id uuid not null default gen_random_uuid(),
  user_id uuid,
  date timestamp with time zone not null,
  year text,
  section text,
  department text,
  morning_attendance jsonb,
  afternoon_attendance jsonb,
  created_at timestamp with time zone default now(),
  constraint attendance_records_pkey primary key (id)
);
```

#### `student_rosters` Table

```sql
create table public.student_rosters (
  user_id uuid not null,
  department text not null,
  year text not null,
  section text not null,
  roster_data jsonb,
  constraint student_rosters_pkey primary key (user_id, department, year, section)
);
```

### 5\. Run the Application

```bash
npm start
```

The application will open in your default browser at `http://localhost:3000`.
