-- Approve all SupplierProfile records
UPDATE "SupplierProfile"
SET "verified" = true, "approved" = true
WHERE "verified" = false OR "approved" = false;

-- Approve all LogisticsProfile records
UPDATE "LogisticsProfile"
SET "verified" = true, "approved" = true
WHERE "verified" = false OR "approved" = false;

-- Approve all MechanicProfile records
UPDATE "MechanicProfile"
SET "verified" = true, "approved" = true
WHERE "verified" = false OR "approved" = false;
