# Limban.com - Astro Website

Personal website built with Astro, featuring modern web technologies and a responsive design.

## 🚀 Features

- **Static Site Generation**: Fast, SEO-friendly pages with Astro's island architecture
- **React Integration**: Interactive components with React
- **Tailwind CSS**: Utility-first styling with custom design system
- **Dark Mode**: Automatic dark/light theme switching
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Performance Optimized**: Image optimization, code splitting, and lazy loading
- **SEO Ready**: Built-in sitemap and SEO plugin
- **Multiple Icon Libraries**: Rich iconography with various icon sets
- **Supabase Integration**: Backend services for database and authentication

## 🛠️ Tech Stack

- **Framework**: [Astro](https://astro.build/) v5.13.5
- **Frontend**: React 19.1.1, React DOM
- **Styling**: Tailwind CSS with custom components (shadcn/ui inspired)
- **Icons**: Multiple icon libraries (Lucide, Radix Icons, Material Symbols, etc.)
- **Deployment**: Static site deployment ready
- **Type Safety**: TypeScript with strict configuration
- **Database**: Supabase for backend services

## 📁 Project Structure

```
/
├── public/                 # Static assets (images, fonts, etc.)
├── src/
│   ├── components/         # Reusable UI components
│   ├── layouts/            # Page layouts
│   ├── lib/               # Utility functions
│   ├── pages/             # Route-based pages
│   ├── styles/            # Global styles and CSS variables
│   └── utils/             # Helper functions
├── astro.config.mjs       # Astro configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

## 🧞 Commands

All commands are run from the root of the project in your terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Install dependencies                             |
| `npm run dev`             | Start development server at `localhost:4321`     |
| `npm run build`           | Build production site to `./dist/`              |
| `npm run preview`         | Preview production build locally                 |
| `npm run astro ...`       | Run Astro CLI commands (`astro add`, `astro check`) |
| `npm run astro -- --help` | Get help with Astro CLI                          |

## 🎨 Styling

This project uses Tailwind CSS with a custom design system:

- **Color Palette**: Custom CSS variables for consistent theming
- **Components**: Reusable CSS classes defined in global CSS
- **Dark Mode**: Built-in support using `prefers-color-scheme`
- **Responsive**: Mobile-first approach with responsive breakpoints

## 🔧 Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Visit `http://localhost:4321` in your browser

## 🚀 Deployment

The site is built for static hosting. After running `npm run build`, the `dist/` folder contains all files needed for deployment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 👀 Want to learn more?

- [Astro Documentation](https://docs.astro.build)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev/learn/tutorial-tic-tac-toe)

## 📄 License

This project is licensed under the MIT License.
