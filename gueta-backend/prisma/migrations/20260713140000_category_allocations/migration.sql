-- CreateTable
CREATE TABLE "CategoryAllocation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'ILS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CategoryAllocation_userId_idx" ON "CategoryAllocation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryAllocation_userId_categoryId_key" ON "CategoryAllocation"("userId", "categoryId");

-- AddForeignKey
ALTER TABLE "CategoryAllocation" ADD CONSTRAINT "CategoryAllocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryAllocation" ADD CONSTRAINT "CategoryAllocation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SpendingCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
