-- Fix REVELATION Plan Price
-- Execute this SQL on your Railway PostgreSQL database

-- Step 1: Check current amount
SELECT id, name, amount, (amount::numeric / 100) as current_price_dollars
FROM plans 
WHERE name LIKE '%Test%' OR name LIKE '%REVELATION%';

-- Step 2: Update to correct amount ($299 = 29900 cents)
UPDATE plans 
SET amount = 29900, 
    name = 'REVELATION',
    description = 'Complete leadership assessment with 360° feedback',
    updated_at = NOW()
WHERE name LIKE '%Test%' OR name LIKE '%REVELATION%';

-- Step 3: Verify the fix
SELECT id, name, amount, (amount::numeric / 100) as price_dollars, interval, status
FROM plans 
WHERE name = 'REVELATION';

-- Expected result:
-- amount = 29900
-- price_dollars = 299.00
