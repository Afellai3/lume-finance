-- Lume Finance Database Schema
-- SQLite compatible schema for personal finance management with deep cost breakdown

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Accounts table: bank accounts, credit cards, cash wallets
CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('checking', 'savings', 'credit_card', 'cash', 'investment')),
    balance REAL NOT NULL DEFAULT 0.0,
    currency TEXT NOT NULL DEFAULT 'EUR',
    description TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table: expense and income categories
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    parent_id INTEGER,
    icon TEXT,
    color TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Transactions table: all financial movements
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TIMESTAMP NOT NULL,
    amount REAL NOT NULL CHECK(amount > 0),
    type TEXT NOT NULL CHECK(type IN ('income', 'expense', 'transfer')),
    category_id INTEGER,
    account_id INTEGER NOT NULL,
    to_account_id INTEGER, -- For transfers
    description TEXT NOT NULL,
    notes TEXT,
    is_recurring BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (to_account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- ============================================================================
-- COST BREAKDOWN ENGINE TABLES
-- ============================================================================

-- Assets table: physical items with ongoing costs (cars, appliances, etc.)
CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('vehicle', 'appliance', 'property', 'other')),
    purchase_date DATE,
    purchase_price REAL,
    
    -- Vehicle specific fields
    vehicle_fuel_type TEXT CHECK(vehicle_fuel_type IN ('gasoline', 'diesel', 'electric', 'hybrid', 'lpg')),
    vehicle_avg_consumption REAL, -- L/100km or kWh/100km
    vehicle_maintenance_cost_per_km REAL,
    
    -- Appliance specific fields
    appliance_power_rating REAL, -- Watts
    appliance_avg_hours_per_day REAL,
    
    -- General
    estimated_lifetime_years INTEGER,
    depreciation_rate REAL, -- Annual percentage
    notes TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Asset usage tracking: record actual usage (km driven, hours used, etc.)
CREATE TABLE IF NOT EXISTS asset_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL,
    date DATE NOT NULL,
    
    -- Usage metrics
    km_driven REAL, -- For vehicles
    hours_used REAL, -- For appliances
    kwh_consumed REAL, -- For electric devices
    
    -- Cost at time of usage
    fuel_price_per_liter REAL,
    electricity_price_per_kwh REAL,
    
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

-- Cost breakdowns: granular decomposition of transaction costs
CREATE TABLE IF NOT EXISTS cost_breakdowns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL,
    asset_id INTEGER, -- Link to asset if applicable
    
    component_name TEXT NOT NULL, -- e.g., 'fuel', 'wear', 'electricity', 'base_cost'
    component_value REAL NOT NULL,
    unit TEXT, -- e.g., 'EUR', 'km', 'kWh'
    percentage_of_total REAL, -- Percentage of parent transaction
    
    -- Calculation metadata
    calculation_method TEXT, -- Description of how this was calculated
    calculation_params TEXT, -- JSON string with parameters used
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL
);

-- Cost centers: allocate costs to different areas (e.g., kitchen, bedroom for utilities)
CREATE TABLE IF NOT EXISTS cost_centers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    type TEXT, -- e.g., 'room', 'activity', 'person'
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cost center allocations: distribute transaction costs across centers
CREATE TABLE IF NOT EXISTS cost_center_allocations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL,
    cost_center_id INTEGER NOT NULL,
    allocated_amount REAL NOT NULL,
    allocation_percentage REAL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (cost_center_id) REFERENCES cost_centers(id) ON DELETE CASCADE
);

-- ============================================================================
-- BUDGETS & PLANNING
-- ============================================================================

-- Budgets table: spending limits per category
CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    amount REAL NOT NULL CHECK(amount > 0),
    period TEXT NOT NULL CHECK(period IN ('daily', 'weekly', 'monthly', 'yearly')),
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Savings goals: target amounts to save
CREATE TABLE IF NOT EXISTS savings_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    target_amount REAL NOT NULL CHECK(target_amount > 0),
    current_amount REAL DEFAULT 0.0,
    target_date DATE,
    account_id INTEGER,
    priority INTEGER DEFAULT 1 CHECK(priority BETWEEN 1 AND 5),
    is_completed BOOLEAN DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL
);

-- ============================================================================
-- INVESTMENTS & SIMULATIONS
-- ============================================================================

-- Investments table: stocks, bonds, funds, crypto
CREATE TABLE IF NOT EXISTS investments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    symbol TEXT, -- Ticker symbol (e.g., AAPL, BTC)
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('stock', 'bond', 'fund', 'etf', 'crypto', 'other')),
    quantity REAL NOT NULL DEFAULT 0,
    purchase_price REAL,
    purchase_date DATE,
    current_price REAL,
    currency TEXT DEFAULT 'EUR',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- Investment transactions: buy/sell operations
CREATE TABLE IF NOT EXISTS investment_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    investment_id INTEGER NOT NULL,
    date TIMESTAMP NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('buy', 'sell', 'dividend')),
    quantity REAL NOT NULL,
    price_per_unit REAL NOT NULL,
    total_amount REAL NOT NULL,
    fees REAL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (investment_id) REFERENCES investments(id) ON DELETE CASCADE
);

-- Loans & mortgages: track debt and payment schedules
CREATE TABLE IF NOT EXISTS loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('mortgage', 'personal_loan', 'car_loan', 'student_loan', 'other')),
    principal_amount REAL NOT NULL,
    interest_rate REAL NOT NULL, -- Annual percentage
    term_months INTEGER NOT NULL,
    start_date DATE NOT NULL,
    monthly_payment REAL NOT NULL,
    remaining_balance REAL,
    account_id INTEGER, -- Account used for payments
    notes TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL
);

-- Loan payments: track individual payments
CREATE TABLE IF NOT EXISTS loan_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    loan_id INTEGER NOT NULL,
    payment_date DATE NOT NULL,
    amount_paid REAL NOT NULL,
    principal_paid REAL NOT NULL,
    interest_paid REAL NOT NULL,
    remaining_balance REAL NOT NULL,
    transaction_id INTEGER, -- Link to transaction if recorded
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_cost_breakdowns_transaction ON cost_breakdowns(transaction_id);
CREATE INDEX IF NOT EXISTS idx_asset_usage_asset ON asset_usage(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_usage_date ON asset_usage(date);
CREATE INDEX IF NOT EXISTS idx_investments_account ON investments(account_id);
CREATE INDEX IF NOT EXISTS idx_loan_payments_loan ON loan_payments(loan_id);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Update account balance on transaction insert
CREATE TRIGGER IF NOT EXISTS update_account_balance_on_insert
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
    UPDATE accounts 
    SET balance = balance + 
        CASE 
            WHEN NEW.type = 'income' THEN NEW.amount
            WHEN NEW.type = 'expense' THEN -NEW.amount
            WHEN NEW.type = 'transfer' THEN -NEW.amount
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.account_id;
    
    -- Handle transfer destination
    UPDATE accounts
    SET balance = balance + NEW.amount,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.to_account_id AND NEW.type = 'transfer';
END;

-- Update timestamps on record modification
CREATE TRIGGER IF NOT EXISTS update_accounts_timestamp
AFTER UPDATE ON accounts
FOR EACH ROW
BEGIN
    UPDATE accounts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_transactions_timestamp
AFTER UPDATE ON transactions
FOR EACH ROW
BEGIN
    UPDATE transactions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_assets_timestamp
AFTER UPDATE ON assets
FOR EACH ROW
BEGIN
    UPDATE assets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;