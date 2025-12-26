# Tenant Management Frontend

A modern, full-featured tenant management application built with Next.js 14, React 18, TypeScript, and Tailwind CSS.

## Features

- 👥 **Easy Tenant Tracking** - Organize all tenant information in one place
- 💰 **Rent Management** - Track payments and manage rent schedules
- 🔧 **Maintenance Requests** - Handle maintenance requests and repairs efficiently
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- ⚡ **Fast Performance** - Built with Next.js 14 for optimal performance
- 🔒 **TypeScript** - Full type safety with TypeScript

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/)
- **UI Library**: [React 18](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Linting**: [ESLint](https://eslint.org/)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. Start the development server:

```bash
npm run dev
# or
yarn dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint to check code quality
- `npm run type-check` - Check TypeScript types

## Project Structure

```
tenant-fe/
├── app/                 # Next.js 14 app directory
│   ├── layout.tsx      # Root layout component
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── components/         # Reusable React components
├── public/            # Static assets
├── tailwind.config.ts # Tailwind CSS configuration
├── tsconfig.json      # TypeScript configuration
└── package.json       # Dependencies and scripts
```

## Development

### Add a New Page

Create a new file in the `app` directory:

```typescript
// app/my-page/page.tsx
export default function MyPage() {
  return <div>My Page</div>;
}
```

### Add a New Component

Create a new file in the `components` directory:

```typescript
// components/MyComponent.tsx
export default function MyComponent() {
  return <div>My Component</div>;
}
```

## Styling

This project uses Tailwind CSS for styling. Utility classes can be used directly in your components:

```typescript
<div className="bg-blue-500 text-white p-4 rounded-lg">
  Styled with Tailwind CSS
</div>
```

## Type Safety

Make sure to add proper TypeScript types to your components:

```typescript
interface Props {
  title: string;
  count: number;
}

export default function Component({ title, count }: Props) {
  return (
    <div>
      {title}: {count}
    </div>
  );
}
```

## Building for Production

```bash
npm run build
npm start
```

The application will be optimized and ready for deployment.

## Deployment

This Next.js app can be easily deployed to:

- [Vercel](https://vercel.com) (recommended)
- AWS
- Google Cloud
- Azure
- Any Node.js hosting platform

For more information, see the [Next.js deployment documentation](https://nextjs.org/docs/deployment).

## License

MIT

## Support

For support, please reach out to the development team.
