-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "product_name" TEXT,
ALTER COLUMN "product_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "delivery_type" TEXT NOT NULL DEFAULT 'PICKUP',
ADD COLUMN     "deposit_paid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "neighborhood" TEXT,
ADD COLUMN     "number" TEXT,
ADD COLUMN     "payment_method" TEXT NOT NULL DEFAULT 'PIX',
ADD COLUMN     "payment_status" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "pickup_point" TEXT,
ADD COLUMN     "reference" TEXT,
ADD COLUMN     "scheduled_date" TIMESTAMP(3),
ADD COLUMN     "scheduled_time" TEXT,
ADD COLUMN     "street" TEXT;
