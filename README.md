# NBS-LMS (Nazarene Bible School Learning Management System)

A learning management system for the Nazarene Bible School.

## Technologies

- **Frontend Framework**: Vue 3 with `<script setup>` SFCs
- **Build Tool**: Vite
- **UI Components**: Ant Design Vue
- **CSS Utilities**: UnoCSS
- **State Management**: Pinia
- **Routing**: Vue Router
- **API Mocking**: MSW (Mock Service Worker)

## Getting Started

### Prerequisites

- Node.js (latest LTS version recommended)
- Yarn package manager

### Installation

```bash
# Install dependencies
yarn install
```

### Development

```bash
# Start development server
yarn dev
```

### Building for Production

```bash
# Build for production
yarn build

# Preview production build
yarn preview
```

## Project Structure

- **`src/components/`**: Reusable Vue components
- **`src/views/`**: Page components
- **`src/router/`**: Vue Router configuration
- **`src/stores/`**: Pinia state management
- **`src/services/`**: API communication and data transformation
- **`src/composables/`**: Reusable composition functions
- **`src/schemas/`**: Form field schemas and validation rules
- **`src/utils/`**: Utility functions
- **`src/mocks/`**: Mock API implementations

## Form Architecture

This project uses a layered approach for form handling:

1. **Stores Layer** - Manages form state and validation results
2. **Services Layer** - Handles API communication and data format conversion
3. **Composables Layer** - Provides reusable form logic hooks
4. **Schemas Layer** - Defines form fields and validation rules
5. **Utils Layer** - Offers common utility functions

## Configuration Files

- **`vite.config.mjs`**: Vite configuration
- **`uno.config.js`**: UnoCSS configuration
- **`vercel.json`**: Vercel deployment configuration

## Deployment

The application is configured for deployment on Vercel with SPA routing support.

## Learn More

- [Vue 3 Documentation](https://v3.vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Ant Design Vue](https://antdv.com/)
- [UnoCSS](https://github.com/unocss/unocss)
- [Pinia](https://pinia.vuejs.org/)
- [Vue Router](https://router.vuejs.org/)
