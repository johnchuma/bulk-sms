📨 Bulk SMS Platform – Project Requirements
📌 Overview
The Bulk SMS Platform allows clients to manage their contacts, purchase SMS credits, and send messages to their contacts in bulk. Admins have control over client account management, user access, and transaction tracking. The platform includes separate dashboards for clients and admins.

🛠️ Tech Stack
Frontend: React.js, Vanilla JavaScript, Tailwind CSS with vite, axios, and use react-router-dom ... UI should be super good
use there steps to install tailwind css Install Tailwind CSS
Install tailwindcss and @tailwindcss/vite via npm.

Terminal
npm install tailwindcss @tailwindcss/vite
03
Configure the Vite plugin
Add the @tailwindcss/vite plugin to your Vite configuration.

vite.config.ts
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
})
04
Import Tailwind CSS
Add an @import to your CSS file that imports Tailwind CSS.

CSS
@import "tailwindcss";
05
Start your build process
Run your build process with npm run dev or whatever command is configured in your package.json file.

Terminal
npm run dev


Backend: Node.js, Express.js, Sequelize (Vanilla JS), run on port 5000

Database: MySQL

Host: localhost

User: root

Password: (empty)

Database: bulkSMS

🧱 Features
🔐 Authentication & User Roles
Admin Dashboard

Create client accounts (assign email + password)

Each client account can have multiple users

Manage all client transactions

Set custom SMS quantity per transaction (apply discounts manually)

View all clients and their balances

Client Dashboard

Login with email/password

CRUD operations for contacts (name, phone number)

View available SMS balance

Send SMS to:

All contacts

Selected contacts

View transaction history (SMS top-ups only)

Multi-user access for managing same client account

📤 SMS Messaging
Send SMS to all or selected contacts

No need to store message history

Deduct number of SMS sent from client's SMS balance

Calculate number of SMS per message (simple logic: 1 message = 1 SMS unit)

💳 Transactions
One SMS = 25 TSH

Admin can record SMS purchases for clients manually

Discounts supported by manually specifying SMS quantity per transaction

Transactions only recorded by Admin

Each transaction increases client's SMS balance

🧮 Database Structure (High-Level)
Tables:
admins (id, email, password)

clients (id, name, email, password, created_at)

client_users (id, client_id, email, password)

contacts (id, client_id, name, phone)

transactions (id, client_id, sms_quantity, total_amount, created_at)

sms_balance (client_id, total_sms_available)

(Optional) sent_logs (for future extension)

🔄 CRUD Modules
Clients (admin only)

Client Users (admin or client)

Contacts (client only)

Transactions (admin only)

SMS Sending (client only, no message persistence)

🧪 Sequelize Setup
Initialize Sequelize:

bash
Copy
Edit
npx sequelize init
Configure config/config.json for MySQL:

json
Copy
Edit
{
"development": {
"username": "root",
"password": "",
"database": "bulkSMS",
"host": "127.0.0.1",
"dialect": "mysql"
}
}
Create models and migrations:

bash
Copy
Edit
npx sequelize model:generate --name Client --attributes name:string,email:string,password:string
npx sequelize model:generate --name Contact --attributes name:string,phone:string,clientId:integer
npx sequelize model:generate --name Transaction --attributes clientId:integer,sms_quantity:integer,total_amount:integer
npx sequelize model:generate --name ClientUser --attributes email:string,password:string,clientId:integer
npx sequelize model:generate --name SmsBalance --attributes clientId:integer,total_sms_available:integer
💡 Use sequelize-cli to run:

bash
Copy
Edit
npx sequelize db:create
npx sequelize db:migrate
📁 Module Structure (Backend)
markdown
Copy
Edit
/controllers

- clientController.js
- contactController.js
- transactionController.js
- smsController.js
- authController.js
  /models
  /migrations
  /routes
- adminRoutes.js
- clientRoutes.js
  /middleware
- auth.js
  📲 Frontend Pages (React)
  /admin/dashboard

View & create clients

View client SMS balances

Add SMS transactions

/client/dashboard

Manage contacts

Send SMS

View balance

View transaction history

Invite/manage other users

/login (Admin & Client)

✅ Other Considerations
Authentication should include JWT tokens

Secure all routes using role-based middleware

Sanitize and validate all inputs

Send SMS via an external SMS gateway (integration placeholder)

Would you like me to generate:

Sequelize model files?

Sample routes and controllers?

Database ERD diagram?

Let me know how far you’d like to go from here.
