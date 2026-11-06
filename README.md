# Mini Department Store Management App

A lightweight, robust Android store management application built with **React Native**, **Expo (SDK 58)**, **TypeScript**, **Expo Router**, **Firebase Authentication**, and **Cloud Firestore**.

Designed specifically for small department store owners to manage inventory, record purchases and sales with automated calculations, track daily expenses, view financial summaries (Sales, Purchases, COGS, Gross Profit, Expenses, Net Profit), and enforce strict data isolation.

---

## 📱 Mandatory Milestone 1 Features

### 3.1 Authentication
- **Email/Password**: Seamless registration, login, and logout.
- **Session Persistence**: Backed by `@react-native-async-storage/async-storage` via Firebase's native persistence handler. Retains user session automatically across app restarts.
- **User Data Isolation**: Every store's records are partitioned under `users/{userId}/*` in Cloud Firestore.
- **Firestore Security Rules**: Strict rules (`firestore.rules`) enforce that authenticated users can only read and write their own store data.

### 3.2 Product Master
- **Add, Edit, and View Products** with:
  - Product Name
  - Measurement Unit (`Kg` / `Litre` / `Nos`)
  - Opening Stock Quantity
  - Opening Stock Purchase Rate
  - Real-time stock valuation (`stock * openingRate`)
- **1-Tap Sample Products Seeder**: Preloaded with **Rice (Kg)**, **Sugar (Kg)**, **Cooking Oil (Litre)**, and **Biscuits (Nos)** for immediate evaluation and testing.

### 3.3 Purchase Entry
- Records Date (defaults to `YYYY-MM-DD`), Supplier Name, Product, Quantity, and Unit Purchase Rate.
- **Live Auto-Calculation**: Automatically computes `Total = Quantity * Rate`.
- **Atomic Stock Increase**: Uses Firestore transactions to atomically record the purchase and increment the product's inventory.

### 3.4 Sales Entry
- Records Date, Product, Quantity, and Unit Selling Rate.
- **Live Auto-Calculation**: Automatically computes `Total = Quantity * Rate`.
- **Stock Constraint Enforcement**: Rejects sales exceeding available stock with real-time UI warning and Firestore transaction-level validation.
- **Atomic Stock Decrease**: Atomically decrements product stock and logs sale data (including cost rate for COGS calculation).

### 3.5 Expense Entry
- Records Date, Category, Description, and Amount.
- Supported categories: **Rent**, **Electricity**, **Salary**, **Transportation**, and **Miscellaneous**.

### 3.6 Screens & Clean UI
1. **Login / Registration Screen** (`app/login.tsx`): Clean toggle between Sign In and Register, validation, and error banners.
2. **Dashboard Screen** (`app/(app)/index.tsx`): Real-time metrics for Sales, Purchases, Expenses, Gross & Net Profit, Current Stock Valuation, quick action buttons, and low-stock indicators.
3. **Product Master Screen** (`app/(app)/products.tsx`): Inventory list with live stock values, search/units, and Add/Edit modal.
4. **Sales Entry Screen** (`app/(app)/sales.tsx`): Product selector, stock indicator, quantity validation, live auto-total.
5. **Purchase Entry Screen** (`app/(app)/purchase.tsx`): Supplier input, product selector, quantity, rate, live auto-total.
6. **Expense Entry Screen** (`app/(app)/expense.tsx`): Category selector chips, description, and amount.
7. **Transaction History Screen** (`app/(app)/history.tsx`): Filterable timeline (All, Sales, Purchases, Expenses) with formatted amounts and color-coded status badges.

---

## 📂 Minimal & Modular Project Structure

The project has been intentionally kept minimal with clean separation of concerns and proper function decomposition:

```
App-Development/
├── app/
│   ├── _layout.tsx           # Root navigation & Auth state listener
│   ├── login.tsx             # Login & Registration screen
│   └── (app)/
│       ├── _layout.tsx       # Bottom tab bar & store header
│       ├── index.tsx         # Dashboard screen
│       ├── products.tsx      # Product Master screen
│       ├── sales.tsx         # Sales Entry screen
│       ├── purchase.tsx      # Purchase Entry screen
│       ├── expense.tsx       # Expense Entry screen
│       └── history.tsx       # Transaction History screen
├── src/
│   ├── types.ts              # TypeScript interfaces & types
│   ├── firebase.ts           # Firebase App, Auth with AsyncStorage, and Firestore
│   ├── calculations.ts       # Pure calculation & validation functions
│   ├── storeService.ts       # Firestore atomic transactions & subscriptions
│   ├── AuthContext.tsx       # Authentication context & persistent session
│   └── styles/               # Centralized styles/CSS folder for entire application
│       ├── theme.ts          # Color palette, spacing, and radius tokens
│       ├── layoutStyles.ts   # Root stack and tab bar styles
│       ├── authStyles.ts     # Login & registration screen styles
│       ├── dashboardStyles.ts# Dashboard & metric grid styles
│       ├── productStyles.ts  # Product master & modal styles
│       ├── entryStyles.ts    # Reusable form styles (sales, purchase, expense)
│       ├── historyStyles.ts  # Transaction history timeline styles
│       └── index.ts          # Central export barrel
├── tests/
│   └── calculations.test.js  # Automated unit tests for calculations & stock validation
├── firestore.rules           # Cloud Firestore security rules
└── .env.example              # Template environment file for Firebase credentials
```

---

## 🧪 Automated Testing & Verification

Run the automated test suite covering amount calculations, zero/negative rejection, stock rejection logic, and the assessment sample scenario:

```bash
npm test
```

Run TypeScript typechecking:

```bash
npm run typecheck
```

---

## ⚙️ Setup & Execution

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase (Spark Plan - Free)
1. In the [Firebase Console](https://console.firebase.google.com/), create a project and enable:
   - **Authentication** → Email/Password provider.
   - **Cloud Firestore** → Create database in production mode.
2. Deploy the provided `firestore.rules`:
   ```bash
   firebase deploy --only firestore:rules
   ```
3. Copy `.env.example` to `.env` and fill in your Firebase Web App credentials:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-app
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   EXPO_PUBLIC_FIREBASE_APP_ID=1:...
   ```

### 3. Run Locally
```bash
npx expo start
```
- Press `a` to run on Android Emulator or scan the QR code with **Expo Go** on a physical Android phone.

---

## 📦 Building Android APK (Expo EAS)

To build an installable standalone Android APK:

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   eas login
   ```
2. Configure EAS project:
   ```bash
   eas build:configure
   ```
3. In `eas.json`, configure a preview build for APK:
   ```json
   {
     "build": {
       "preview": {
         "android": {
           "buildType": "apk"
         }
       }
     }
   }
   ```
4. Build the APK in the cloud:
   ```bash
   eas build -p android --profile preview
   ```
5. Download the `.apk` file directly onto your Android device.

---

## 📊 Assessment Sample Scenario Walkthrough

The calculation engine was verified against the official test scenario:
1. **Products Added**:
   - Rice (Kg, 0 opening, ₹50 opening rate)
   - Sugar (Kg, 0 opening, ₹40 opening rate)
2. **Purchases**:
   - 100 Kg Rice @ ₹50 = ₹5,000
   - 50 Kg Sugar @ ₹40 = ₹2,000
   - *Total Purchases: ₹7,000*
3. **Sales**:
   - 30 Kg Rice @ ₹65 = ₹1,950 (COGS: 30 * 50 = ₹1,500)
   - 20 Kg Sugar @ ₹50 = ₹1,000 (COGS: 20 * 40 = ₹800)
   - *Total Sales: ₹2,950* | *Estimated COGS: ₹2,300* | *Gross Profit: ₹650*
4. **Expenses**:
   - Transportation = ₹200
   - Electricity = ₹150
   - Miscellaneous = ₹100
   - *Total Expenses: ₹450*
5. **Net Results**:
   - *Gross Profit (₹650) - Expenses (₹450) = Net Profit ₹200*
   - *Remaining Stock: 70 Kg Rice, 30 Kg Sugar*
   - *Stock Valuation: 70 * 50 + 30 * 40 = ₹4,700*

---

## 🗓️ Weekly Development Log

| Day | Focus | Summary |
| :--- | :--- | :--- |
| **SATURDAY** | Planning and task breakdown | • Planned the project work for the week.<br>• Reviewed the tasks and outlined the steps needed to begin development. |
| **SUNDAY** | Semester examination | • The next day was occupied by a semester examination.<br>• As a result, no project-related work was completed on this day. |
| **MONDAY** | Development environment and project setup | • Installed and configured the required development tools and dependencies.<br>• Set up Firebase for the application.<br>• Planned and organized the project’s file and folder structure. |
| **TUESDAY** | Milestone 1 UI design | • Created the basic UI designs required for Milestone 1 using Figma.<br>• Outlined the main screens and their visual structure before implementation. |
| **WEDNESDAY** | Authentication implementation and debugging | • Created the authentication page.<br>• Completed the Firebase configuration and connected it to the application.<br>• Tested the authentication flow and investigated an issue with the loading indicator. |
| **THURSDAY** | Semester examination | • The next day was occupied by a semester examination.<br>• As a result, no project-related work was completed on this day. |
| **FRIDAY** | Milestone 1 finalization | • Completed the final additions to the video.<br>• Finalized the remaining work and required items for completing Milestone 1. |


