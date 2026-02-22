# Inventory Management System (نظام إدارة المخزون)

## Overview
A comprehensive inventory management system for managing goods imported from China. Built with Express.js backend and React frontend with Arabic RTL interface.

## Architecture
- **Frontend**: React + Vite + TailwindCSS + Shadcn UI, RTL Arabic layout
- **Backend**: Express.js with PostgreSQL via Drizzle ORM
- **Database**: PostgreSQL (Neon-backed via Replit)
- **Auth**: Session-based with bcrypt password hashing, admin/user roles

## Key Features
- Authentication with session management and role-based access (admin/user)
- User management (admin only) - create/list users with role assignment
- Products management with status tracking, Excel import, quantity reset, and aging alerts
- Suppliers management with edit/delete (integrity checks block deletion if related records exist)
- Categories & Warehouses management (categories blocked from deletion if products exist)
- Order creation workflow (select supplier → select products → confirm with prices in CNY/USD)
- Delivery/Receiving workflow (receive goods from supplier with dimensions)
- Container shipping management
- Container arrival tracking
- History lists for orders, deliveries, and containers
- Supplier account management with remaining balance calculation, payment history, and print functionality
- Status aging alerts (products with unchanged status for 3+ days get visual warnings)

## Project Structure
- `shared/schema.ts` - All database schemas and types (users, products, orders, deliveries, containers, payments)
- `server/db.ts` - Database connection
- `server/storage.ts` - Storage layer with all CRUD operations
- `server/routes.ts` - API routes (includes auth middleware)
- `server/seed.ts` - Database seeding
- `client/src/pages/` - All page components
- `client/src/components/app-sidebar.tsx` - Navigation sidebar

## Database Tables
users, categories, suppliers, warehouses, products, product_parts, orders, order_items, deliveries, delivery_items, containers, container_items, container_documents, payments, sessions, user_categories, shipping_companies, shipping_payments, cashbox_transactions

## Product Status Flow
purchase_order → ordered → received → semi_manufactured → shipping → arrived

## Semi-Manufactured / Composite Products
- Products with "semi_manufactured" status can have parts defined via product_parts table
- Each part has: name, quantity, length, width, height, weight, piecesPerCarton
- Parts are managed via Layers icon button on products page (only visible for semi_manufactured products)
- Parts list is displayed during delivery receiving for semi-manufactured products
- "Add composite product" button creates product directly with semi_manufactured status and opens parts dialog

## User Role Restrictions
- Admin users: Full access to all pages and features
- Regular users (role: user): Only see Dashboard and Products pages in sidebar (create products and track status only)
- Warehouse users (role: warehouse): See Dashboard, Products, Warehouses, Orders (read-only), Deliveries, Warehouse Inventory, Shipping. Cannot see any prices anywhere. Cannot create orders.
- Non-admin users cannot access: supplier accounts, shipping accounts, cashbox, expenses, user management

## Currencies
CNY (Yuan) and USD (Dollar)

## Auth
- Default admin: username "admin", password "admin123"
- Session-based auth with express-session and connect-pg-simple
- Role enum: admin, user, warehouse

## Category-Based Permissions
- user_categories table links users to permitted categories
- Admin users bypass all category restrictions (see/create in all categories)
- Non-admin users can only view/create products in their permitted categories
- User management page (admin only) includes category assignment dialog
- Backend enforces permissions on GET /api/products and POST /api/products
- Auth response includes allowedCategories array for frontend filtering
- Excel import respects category permissions for non-admin users

## Shipping Companies
- shipping_companies table: id, name, phone, address
- Containers reference shippingCompanyId (FK to shipping_companies)
- Containers have priceCNY and priceUSD fields for container pricing
- Shipping page: dropdown to select shipping company + price fields in CNY/USD
- Shipping company accounts page: similar to supplier accounts with payment tracking, currency conversion, print

## Warehouse Inventory
- /warehouse-inventory page shows products with "received" or "semi_manufactured" status
- Displays quantity, weight, volume, dimensions for each product
- Composite products show their parts with individual weight/volume
- Print functionality for warehouse inventory report
- Summary cards: total products, quantity, weight, volume

## Order Edit & Print
- Orders history: each order card has print button for individual order printing
- Each order item has edit button to modify quantity, price, currency
- Order print opens formatted print window with supplier info, items table, totals

## Cashbox (صندوق الحسابات)
- cashbox_transactions table: id, type (income/expense), category (supplier/shipping/other/expense), amount, currency, supplierId, shippingCompanyId, expenseId, description, createdAt
- /cashbox page: income/expense tracking with dual currency (CNY/USD) balance cards
- Transaction categories: supplier payments, shipping company payments, expense box entries, other
- Features: add/edit/delete transactions, currency exchange, supplier/shipping payments, type/currency filters, print functionality
- Currency exchange: converts between CNY/USD by creating two linked transactions (expense from source + income to target)
- Supplier payment from cashbox: creates payment record in supplier accounts + cashbox expense entry (linked via paymentId)
- Shipping payment from cashbox: creates payment record in shipping accounts + cashbox expense entry (linked via shippingPaymentId)
- API endpoints: POST /api/cashbox/exchange, POST /api/cashbox/supplier-payment, POST /api/cashbox/shipping-payment
- Summary cards: income CNY, income USD, expense CNY, expense USD, balance CNY, balance USD
- Linked payments: cashbox_transactions has paymentId, shippingPaymentId, and expenseId columns
- Supplier payments auto-create cashbox expense entries (linked via paymentId)
- Shipping payments auto-create cashbox expense entries (linked via shippingPaymentId)
- Expense box entries auto-create cashbox expense entries (linked via expenseId)
- Linked entries show badge ("دفعة مورد" / "دفعة شحن" / "مصروف") and cannot be edited/deleted from cashbox page
- Edit/delete linked entries only via supplier accounts, shipping accounts, or expenses pages

## Expenses Box (صندوق المصاريف)
- expenses table: id, title, amount, currency, description, createdAt
- /expenses page: dedicated expense tracking with dual currency summary cards
- Features: add/edit/delete expenses, currency filter, print functionality
- Each expense auto-creates a linked cashbox transaction (category: "expense")
- Edit/delete expenses auto-updates/deletes the linked cashbox entry
- Summary cards: total expenses CNY, total expenses USD

## Container Invoices (سجل الفواتير)
- container_documents table: id, containerId, invoiceNumber, invoiceDate, shippingBill, originCertificate, conformityCertificate, invoice, moneyArrival, moneyArrivalCurrency, cashboxTransactionId
- Auto-created when a container is shipped (createContainer auto-inserts row with invoiceNumber and date)
- /container-invoices page: table with toggle switches for certificates, editable invoice and money arrival fields
- When moneyArrival is entered, auto-creates cashbox income transaction (linked via cashboxTransactionId)
- Updating moneyArrival updates the linked cashbox entry; clearing it deletes the cashbox entry

## Recent Changes
- Added container invoices tracking page with auto-cashbox integration
- Added cashbox currency exchange (CNY↔USD) with dual transaction creation
- Added cashbox supplier/shipping payment buttons linked to their respective accounts
- Added expenses box (صندوق المصاريف) with cashbox auto-linking
- Linked supplier and shipping payments to cashbox: auto-create/update/delete expense entries
- Added cashbox (صندوق الحسابات) for tracking money in/out with dual currency support
- Added shipping companies management (CRUD, accounts with payments, currency conversion, print)
- Added warehouse inventory page with weight/volume tracking and composite product parts display
- Added container pricing in CNY and USD with shipping company selection
- Added order item editing and individual order printing
- Product quantity now updates when delivery is received
- Added category-based permissions system (user_categories table, admin UI, backend enforcement)
- Added semi-manufactured product status with parts management system
- Products page: Layers icon button for semi_manufactured products to manage parts (add/view/delete)
- Deliveries page: parts list displayed when receiving semi-manufactured products
- Added status aging alerts on products page (3-day threshold, amber warning icons)
- Enhanced supplier accounts with remaining balance card, payment history, print, edit/delete payments, and currency conversion
- Added history lists for deliveries and containers
- Excel product import with Arabic/English column name support
- Integrity checks on supplier/category deletion
- Supplier search by name, phone, or address
- Payment edit and delete with confirmation dialogs
- Payment currency conversion between CNY and USD with custom exchange rate
- French date format (dd/mm/yyyy) across all pages using toLocaleDateString("fr-FR")
- Orders page: editable remaining quantity per product, reset button to zero
- Container shipping: supports both received and semi_manufactured products
- Added quantity field to product_parts table
- Removed "purchase" status; all new products default to "purchase_order"
- Non-admin users sidebar restricted to Dashboard and Products only
- Added "Add Composite Product" button with separate dialog
- Added profile settings dialog: users can change username, display name, and password from header
- Profile dialog supports bilingual translations (Arabic/Chinese) for warehouse users
- Added Chinese name (nameZh) field to products: optional bilingual product naming displayed across all pages
- Product forms (add/composite) include Chinese name input field
- Product table shows Chinese name below Arabic name when available
- Search filters match both Arabic and Chinese product names
- Excel import supports Chinese name in column 4
- All enriched product references (orders, deliveries, shipping, supplier accounts) include productNameZh
