# 📨 Bulk SMS Platform

A comprehensive bulk SMS management platform with separate dashboards for administrators and clients. Built with React.js, Node.js, Express.js, and MySQL.

## 🚀 Features

### 🔐 Authentication & User Roles

- **Admin Dashboard**: Complete control over client management, transactions, and system oversight
- **Client Dashboard**: Contact management, SMS sending, and balance tracking
- **Multi-user Support**: Each client can have multiple users accessing the same account

### 📱 SMS Management

- Send SMS to all contacts or selected contacts
- Real-time SMS balance tracking
- Simple SMS calculation (1 message = 1 SMS unit)
- SMS cost: 25 TSH per SMS

### 👥 Client Management (Admin Only)

- Create and manage client accounts
- View client SMS balances
- Manual transaction recording with discount support
- Client user management

### 📊 Contact Management (Client Only)

- Full CRUD operations for contacts (name and phone)
- Bulk contact import
- Contact search and filtering
- Duplicate prevention

### 💳 Transaction System

- Admin-controlled SMS credit purchases
- Transaction history tracking
- Manual discount application
- Balance updates in real-time

## 🛠️ Tech Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Sequelize
- **Database**: MySQL
- **Authentication**: JWT tokens
- **Password Hashing**: bcryptjs
- **Validation**: express-validator

### Frontend

- **Framework**: React.js 18
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Database

- **Host**: localhost
- **User**: root
- **Password**: (empty)
- **Database**: bulkSMS

## 📁 Project Structure

```
bulk sms/
├── bulk-backend/           # Node.js API server
│   ├── controllers/        # Route controllers
│   ├── models/            # Sequelize models
│   ├── routes/            # API routes
│   ├── middleware/        # Authentication middleware
│   ├── config/            # Database configuration
│   ├── seeders/           # Database seeders
│   └── server.js          # Main server file
├── bulk-frontend/         # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── layouts/       # Layout components
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   └── App.jsx        # Main app component
│   └── package.json
└── contacts_insert_final.sql  # Extracted contacts
```

## 🗃️ Database Schema

### Tables

- **admins**: Administrator accounts
- **clients**: Client accounts with authentication
- **client_users**: Additional users for client accounts
- **contacts**: Client contact lists (name, phone)
- **transactions**: SMS purchase records
- **sms_balances**: Current SMS balance per client

### Key Relationships

- Client → SMS Balance (1:1)
- Client → Contacts (1:Many)
- Client → Transactions (1:Many)
- Client → Client Users (1:Many)
- Admin → Transactions (1:Many)

## 🚀 Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MySQL Server
- npm or yarn

### Backend Setup

```bash
cd bulk-backend
npm install
npx sequelize db:create
npm run dev
```

### Frontend Setup

```bash
cd bulk-frontend
npm install
npm run dev
```

### Database Seeding

```bash
cd bulk-backend
npx sequelize db:seed --seed 20250715000001-create-admin.js
```

## 🔑 Default Credentials

### Admin Login

- **Email**: admin@bulksms.com
- **Password**: admin123
- **Access**: Full administrative control

### Client Login

- Create client accounts through the admin panel
- Each client can have multiple users

## 🌐 Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 📡 API Endpoints

### Authentication

- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/client/login` - Client login
- `POST /api/auth/client-user/login` - Client user login
- `GET /api/auth/verify` - Token verification

### Admin Routes

- `GET /api/admin/clients` - List all clients
- `POST /api/admin/clients` - Create new client
- `GET/PUT/DELETE /api/admin/clients/:id` - Client CRUD
- `GET /api/admin/transactions` - View all transactions
- `POST /api/admin/transactions` - Create SMS transaction
- `POST /api/admin/client-users` - Create client user

### Client Routes

- `GET /api/client/contacts` - List contacts
- `POST /api/client/contacts` - Create contact
- `PUT/DELETE /api/client/contacts/:id` - Contact CRUD
- `POST /api/client/contacts/bulk-import` - Bulk import
- `POST /api/client/sms/send` - Send SMS
- `GET /api/client/sms/balance` - Check SMS balance

## 🎯 Key Features Implementation

### SMS Sending

- Select all contacts or specific contacts
- Real-time balance validation
- SMS gateway integration placeholder
- Automatic balance deduction

### Contact Management

- Unique phone number validation per client
- Bulk import with duplicate handling
- Search and pagination
- Clean contact data from DOCX files

### Transaction System

- Manual SMS credit allocation by admin
- Automatic balance updates
- Transaction history with client/admin details
- Flexible pricing with discount support

## 🔧 Configuration

### Environment Variables (.env)

```
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=bulkSMS
DB_DIALECT=mysql
```

### Frontend Configuration

```javascript
// vite.config.js
server: {
  port: 3000,
  proxy: {
    '/api': 'http://localhost:5000'
  }
}
```

## 📱 User Interfaces

### Admin Dashboard

- Client management with SMS balances
- Transaction creation and history
- System overview with statistics
- User management for client accounts

### Client Dashboard

- Contact management (CRUD operations)
- SMS balance display
- SMS sending interface
- Transaction history (SMS purchases only)

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- Protected API routes
- CORS configuration

## 📊 SMS Gateway Integration

The platform includes a placeholder for SMS gateway integration. To implement actual SMS sending:

1. Choose an SMS provider (Twilio, AfricasTalking, etc.)
2. Update the `sendSmsToNumber` function in `smsController.js`
3. Add API credentials to environment variables
4. Configure provider-specific settings

## 🎨 UI/UX Features

- Responsive design for all devices
- Modern Tailwind CSS styling
- Loading states and error handling
- Mobile-friendly navigation
- Clean and intuitive interfaces

## 📈 Future Enhancements

- SMS delivery reports
- Message templates
- Scheduled SMS sending
- Advanced reporting and analytics
- SMS campaign management
- Integration with external contact sources
- Multi-language support

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**

   - Ensure MySQL is running
   - Check database credentials in config
   - Verify database exists

2. **JWT Token Issues**

   - Check JWT_SECRET in environment
   - Verify token expiration settings
   - Clear localStorage if needed

3. **SMS Balance Not Updating**
   - Check transaction hooks in models
   - Verify foreign key relationships
   - Review SQL constraints

## 📞 Support

For technical support or feature requests, please refer to the project documentation or contact the development team.

---

**Built with ❤️ for efficient bulk SMS management**
