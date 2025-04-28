# Wii-Fii Frontend

A modern React-based frontend application for the Wii-Fii WiFi Hotspot management system. This application provides a user-friendly interface for accessing all the features of the Wii-Fii service.

## Features

- **User Authentication**
  - Secure login and registration screens
  - JWT-based authentication with Sanctum
  - Remember me functionality
  - Password reset

- **User Profile Management**
  - Update account details
  - Change password
  - View wallet balance
  - Profile customization

- **Plan Browsing & Purchasing**
  - Dynamic service plan catalog
  - Detailed plan information display
  - Purchase confirmation modals
  - Secure plan checkout process

- **Wallet Management**
  - View current balance and transaction history
  - Wallet funding with Paystack integration
  - Transaction details modal
  - Verification of transactions

- **Voucher System**
  - List purchased vouchers
  - Voucher details display with usage statistics
  - Progress bars for time usage tracking
  - Copy voucher code functionality

- **Responsive Design**
  - Mobile-first approach with responsive navbar
  - Cross-browser compatibility
  - Optimized for various screen sizes

- **Interactive UI Elements**
  - Modal dialogs for important actions
  - Toast notifications for user feedback
  - Loading animations
  - Form validation

## Technology Stack

- **Framework**: React
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: React Hooks
- **Routing**: React Router
- **HTTP Client**: Axios
- **Payment Gateway**: Paystack (@paystack/inline-js)
- **UI Components**: Custom components with TailwindCSS

## Pages

- **Home.jsx** - Landing page with featured plans and hero section
- **Login.jsx** - User authentication with form validation
- **Register.jsx** - New user registration with password confirmation
- **Profile.jsx** - User profile management with wallet balance display
- **Wallet.jsx** - Wallet management, transaction history, and Paystack integration
- **Plans.jsx** - Service plan catalog with detailed information
- **Vouchers.jsx** - Voucher management with usage statistics and details

## Components

- **Navbar.jsx** - Navigation component with responsive mobile menu
- **ServicePlans.jsx** - Reusable plan display component with purchase functionality
- **ui/Modal.jsx** - Reusable modal dialog component with customizable size
- **wallet/TransactionDetails.jsx** - Transaction details display component
- **routes/PrivateRoute.jsx** - Route protection for authenticated users
- **routes/AuthRoute.jsx** - Route protection for unauthenticated users

## Utilities

- **utils/index.js** - Helper utilities including number formatting functions

## Getting Started

1. Clone the repository
2. Navigate to the frontend directory:
   ```
   cd wii-fii-frontend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Configure the API endpoint in `.env`:
   ```
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```
5. Start the development server:
   ```
   npm run dev
   ```
6. Build for production:
   ```
   npm run build
   ```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Opera (latest)

## License

[MIT License](LICENSE)
