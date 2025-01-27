# Trading Journal Application

A simplified yet effective trading journal application built with Next.js and Supabase, designed specifically for beginner traders to develop good journaling habits and learn from their trades.

## Tech Stack

- Next.js (v18.3.1)
- React (v18.3.1)
- TypeScript (v5.6.3)
- Supabase
- Tailwind CSS
- Recharts for data visualization
- Authentication via Supabase Auth

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm/yarn
- Supabase account

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

1. Clone the repository:

```bash
git clone [repository-url]
cd trading-journal
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

### Core Features (Phase 1)

- User authentication
- Basic trade entry system
- Simple dashboard
- Essential analytics

### Enhancement Features (Phase 2)

- Psychology tracking
- Advanced analytics
- Mobile optimization
- Export functionality

## Project Structure

The project follows a standard Next.js application structure with additional organization for trading-specific features:

```
src/
├── components/
│   ├── trade/
│   ├── dashboard/
│   └── psychology/
├── pages/
│   ├── dashboard/
│   ├── trades/
│   ├── analysis/
│   └── journal/
└── lib/
    ├── supabase.ts
    ├── types.ts
    └── utils.ts
```

## Development

### Code Style

The project follows the Airbnb TypeScript Style Guide and Next.js App Router conventions. Code formatting is handled by Prettier.

## Acknowledgments

- Built using Next.js App Router
- Authentication powered by Supabase
- UI components from Radix UI
- Charts powered by Recharts
