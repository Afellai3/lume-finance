-- Lume Finance - Seed Data
-- Sample data for testing and development

-- ============================================================================
-- DEFAULT CATEGORIES
-- ============================================================================

-- Income categories
INSERT INTO categories (name, type, icon, color) VALUES
('Salary', 'income', '💼', '#10b981'),
('Freelance', 'income', '💻', '#34d399'),
('Investments', 'income', '📈', '#6ee7b7'),
('Other Income', 'income', '💰', '#a7f3d0');

-- Expense categories - Main
INSERT INTO categories (name, type, icon, color) VALUES
('Housing', 'expense', '🏠', '#ef4444'),
('Transportation', 'expense', '🚗', '#f97316'),
('Food & Dining', 'expense', '🍽️', '#f59e0b'),
('Utilities', 'expense', '⚡', '#eab308'),
('Healthcare', 'expense', '🏥', '#84cc16'),
('Entertainment', 'expense', '🎮', '#22c55e'),
('Shopping', 'expense', '🛍️', '#14b8a6'),
('Education', 'expense', '📚', '#06b6d4'),
('Personal Care', 'expense', '💇', '#0ea5e9'),
('Insurance', 'expense', '🛡️', '#3b82f6'),
('Savings', 'expense', '💎', '#6366f1'),
('Other Expenses', 'expense', '📦', '#8b5cf6');

-- Expense subcategories
INSERT INTO categories (name, type, parent_id, icon, color) VALUES
-- Transportation subcategories
('Fuel', 'expense', (SELECT id FROM categories WHERE name = 'Transportation'), '⛽', '#fb923c'),
('Car Maintenance', 'expense', (SELECT id FROM categories WHERE name = 'Transportation'), '🔧', '#fdba74'),
('Public Transport', 'expense', (SELECT id FROM categories WHERE name = 'Transportation'), '🚌', '#fed7aa'),
('Parking', 'expense', (SELECT id FROM categories WHERE name = 'Transportation'), '🅿️', '#ffedd5'),

-- Food subcategories
('Groceries', 'expense', (SELECT id FROM categories WHERE name = 'Food & Dining'), '🛒', '#fbbf24'),
('Restaurants', 'expense', (SELECT id FROM categories WHERE name = 'Food & Dining'), '🍴', '#fcd34d'),
('Coffee & Snacks', 'expense', (SELECT id FROM categories WHERE name = 'Food & Dining'), '☕', '#fde68a'),

-- Utilities subcategories
('Electricity', 'expense', (SELECT id FROM categories WHERE name = 'Utilities'), '💡', '#facc15'),
('Water', 'expense', (SELECT id FROM categories WHERE name = 'Utilities'), '💧', '#fde047'),
('Gas', 'expense', (SELECT id FROM categories WHERE name = 'Utilities'), '🔥', '#fef08a'),
('Internet', 'expense', (SELECT id FROM categories WHERE name = 'Utilities'), '🌐', '#fef9c3');

-- ============================================================================
-- SAMPLE ACCOUNTS
-- ============================================================================

INSERT INTO accounts (name, type, balance, currency, description) VALUES
('Main Checking', 'checking', 2500.00, 'EUR', 'Primary bank account'),
('Savings Account', 'savings', 10000.00, 'EUR', 'Emergency fund and savings'),
('Credit Card', 'credit_card', -450.00, 'EUR', 'Visa credit card'),
('Cash Wallet', 'cash', 150.00, 'EUR', 'Physical cash on hand');

-- ============================================================================
-- SAMPLE ASSETS
-- ============================================================================

INSERT INTO assets (name, type, purchase_date, purchase_price, vehicle_fuel_type, vehicle_avg_consumption, vehicle_maintenance_cost_per_km, estimated_lifetime_years, depreciation_rate) VALUES
('Fiat Panda 2020', 'vehicle', '2020-03-15', 12000.00, 'gasoline', 5.5, 0.08, 10, 15.0);

INSERT INTO assets (name, type, purchase_date, purchase_price, appliance_power_rating, appliance_avg_hours_per_day, estimated_lifetime_years) VALUES
('Samsung Refrigerator', 'appliance', '2023-06-10', 650.00, 150, 24, 12),
('LG Washing Machine', 'appliance', '2022-09-20', 450.00, 2000, 1.5, 10),
('Bosch Dishwasher', 'appliance', '2023-01-05', 550.00, 1800, 2, 10);

-- ============================================================================
-- SAMPLE COST CENTERS
-- ============================================================================

INSERT INTO cost_centers (name, type, description) VALUES
('Kitchen', 'room', 'Kitchen area - appliances and utilities'),
('Living Room', 'room', 'Living room - entertainment and utilities'),
('Bedroom', 'room', 'Bedroom - climate control'),
('Commute', 'activity', 'Daily commute costs'),
('Leisure Trips', 'activity', 'Weekend and vacation travel');

-- ============================================================================
-- SAMPLE BUDGETS
-- ============================================================================

INSERT INTO budgets (category_id, amount, period, start_date) VALUES
((SELECT id FROM categories WHERE name = 'Food & Dining'), 400.00, 'monthly', '2026-02-01'),
((SELECT id FROM categories WHERE name = 'Transportation'), 200.00, 'monthly', '2026-02-01'),
((SELECT id FROM categories WHERE name = 'Entertainment'), 150.00, 'monthly', '2026-02-01'),
((SELECT id FROM categories WHERE name = 'Utilities'), 180.00, 'monthly', '2026-02-01');

-- ============================================================================
-- SAMPLE SAVINGS GOALS
-- ============================================================================

INSERT INTO savings_goals (name, target_amount, current_amount, target_date, priority) VALUES
('Emergency Fund', 15000.00, 10000.00, '2026-12-31', 5),
('New Laptop', 1200.00, 450.00, '2026-06-30', 3),
('Summer Vacation', 2500.00, 800.00, '2026-07-01', 2),
('Home Renovation', 8000.00, 1200.00, '2027-03-31', 4);