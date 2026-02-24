# 🗄️ Lume Finance Database

This directory contains the database schema and seed data for Lume Finance.

## Files

- **schema.sql**: Complete database schema with all tables, indexes, and triggers
- **seed_data.sql**: Sample data for testing and development

## Database Structure

### Core Tables
- `accounts` - Bank accounts, credit cards, wallets
- `categories` - Income/expense categories (hierarchical)
- `transactions` - All financial movements

### Cost Breakdown Engine
- `assets` - Physical items with ongoing costs (cars, appliances)
- `asset_usage` - Track actual usage (km, kWh, hours)
- `cost_breakdowns` - Granular cost decomposition
- `cost_centers` - Allocate costs to areas/activities
- `cost_center_allocations` - Distribution of costs

### Budgets & Planning
- `budgets` - Spending limits per category
- `savings_goals` - Target savings amounts

### Investments & Debt
- `investments` - Stocks, bonds, funds, crypto
- `investment_transactions` - Buy/sell operations
- `loans` - Mortgages and loans
- `loan_payments` - Payment schedules

## Setup Instructions

### 1. Create Database

```bash
# From project root
cd database
sqlite3 lume.db < schema.sql
```

### 2. Load Sample Data (Optional)

```bash
sqlite3 lume.db < seed_data.sql
```

### 3. Verify Installation

```bash
sqlite3 lume.db "SELECT name FROM sqlite_master WHERE type='table';"
```

You should see all tables listed.

## Database Features

### Automatic Balance Updates

Account balances are automatically updated via triggers when transactions are inserted:
- Income adds to balance
- Expenses subtract from balance
- Transfers move money between accounts

### Automatic Timestamps

All tables with `updated_at` columns have triggers that automatically update the timestamp on modification.

### Referential Integrity

- Foreign keys ensure data consistency
- Cascade deletes remove related records
- NULL on delete for optional relationships

## Example Queries

### Monthly spending by category

```sql
SELECT 
    c.name,
    SUM(t.amount) as total
FROM transactions t
JOIN categories c ON t.category_id = c.id
WHERE t.type = 'expense'
  AND strftime('%Y-%m', t.date) = '2026-02'
GROUP BY c.name
ORDER BY total DESC;
```

### Vehicle cost breakdown

```sql
SELECT 
    a.name as vehicle,
    cb.component_name,
    SUM(cb.component_value) as total_cost
FROM cost_breakdowns cb
JOIN assets a ON cb.asset_id = a.id
WHERE a.type = 'vehicle'
GROUP BY a.name, cb.component_name;
```

### Budget vs actual spending

```sql
SELECT 
    c.name as category,
    b.amount as budget,
    COALESCE(SUM(t.amount), 0) as spent,
    b.amount - COALESCE(SUM(t.amount), 0) as remaining
FROM budgets b
JOIN categories c ON b.category_id = c.id
LEFT JOIN transactions t ON t.category_id = c.id 
    AND t.type = 'expense'
    AND t.date >= b.start_date
    AND (b.end_date IS NULL OR t.date <= b.end_date)
WHERE b.is_active = 1
GROUP BY c.name, b.amount;
```

## Migration Strategy

For production deployment:

1. **Development**: SQLite (local file)
2. **Production**: PostgreSQL (with minor syntax adjustments)

Key differences to handle:
- `AUTOINCREMENT` → `SERIAL` or `IDENTITY`
- `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` → `TIMESTAMP DEFAULT NOW()`
- `BOOLEAN` types work in both

## Backup

```bash
# Backup database
sqlite3 lume.db .dump > backup.sql

# Restore from backup
sqlite3 lume_restored.db < backup.sql
```