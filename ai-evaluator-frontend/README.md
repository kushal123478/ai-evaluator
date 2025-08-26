# AI Evaluator Frontend

A modern React-based frontend application for the AI Output Evaluator, providing an intuitive interface for validating AI-extracted document data.

## Features

- **Document Viewer**: Responsive PDF viewer with zoom controls
- **Data Validation**: Interactive JSON editor for validating AI outputs
- **Dashboard Analytics**: Visual performance metrics and trends
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live feedback and validation status

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **PDF Viewer**: react-pdf
- **Icons**: Lucide React
- **Routing**: React Router
- **Deployment**: Azure Static Web Apps

## Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-evaluator-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm run preview  # Preview production build locally
```

## Features Overview

### PDF Viewer
- **Responsive Scaling**: Automatically adapts to screen size
- **Manual Zoom**: Zoom in/out with buttons, mouse wheel, or keyboard shortcuts
- **Keyboard Shortcuts**: 
  - `Ctrl/Cmd + +` - Zoom in
  - `Ctrl/Cmd + -` - Zoom out
  - `Ctrl/Cmd + 0` - Reset to fit width
  - `Ctrl/Cmd + Scroll` - Mouse wheel zoom

### Data Validation
- **Interactive JSON Editor**: Click fields to mark as correct/incorrect
- **Visual Feedback**: Color-coded validation states
- **Comments**: Add notes for incorrect fields
- **Progress Tracking**: Real-time validation progress

### Dashboard
- **Performance Metrics**: Accuracy trends and field performance
- **Visual Charts**: Interactive data visualizations
- **Filter Options**: Date range and field-specific filtering

## Project Structure

```
├── src/
│   ├── components/           # Reusable components
│   │   ├── PDFViewer.tsx    # PDF display component
│   │   ├── JSONEditor.tsx   # Interactive JSON editor
│   │   └── Dashboard.tsx    # Analytics dashboard
│   ├── pages/               # Page components
│   │   ├── DocumentsPage.tsx
│   │   └── EvaluationPage.tsx
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   └── main.tsx            # Application entry point
├── public/                  # Static assets
├── index.html              # HTML template
└── vite.config.ts          # Vite configuration
```

## Environment Configuration

Create `.env.local` for local development:

```bash
# API Backend URL
VITE_API_BASE_URL=http://localhost:5000

# Environment
VITE_ENVIRONMENT=development
```

For production, these will be configured in Azure Static Web Apps.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript compiler check

## Azure Deployment

This project is configured for deployment to Azure Static Web Apps with GitHub Actions.

### Prerequisites

1. Azure Static Web Apps resource
2. GitHub repository
3. GitHub Secret configured:
   - `AZURE_STATIC_WEB_APPS_API_TOKEN`

### Deployment Process

1. Push to `main` branch triggers automatic deployment
2. Vite builds the production bundle
3. Static files deployed to Azure Static Web Apps
4. Custom domain and HTTPS automatically configured

### Production Configuration

The frontend is configured to work with the backend API through:
- Environment-specific API URLs
- CORS handling
- Proxy configuration for development

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Ensure TypeScript compilation passes
6. Submit a pull request

## License

[Add your license here]