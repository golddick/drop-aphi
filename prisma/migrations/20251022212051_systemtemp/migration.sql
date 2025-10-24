-- CreateTable
CREATE TABLE "SystemEmailTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "elements" JSONB NOT NULL,
    "subject" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemEmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EmailToSystemEmailTemplate" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EmailToSystemEmailTemplate_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "SystemEmailTemplate_userId_idx" ON "SystemEmailTemplate"("userId");

-- CreateIndex
CREATE INDEX "SystemEmailTemplate_category_idx" ON "SystemEmailTemplate"("category");

-- CreateIndex
CREATE INDEX "SystemEmailTemplate_isPublic_idx" ON "SystemEmailTemplate"("isPublic");

-- CreateIndex
CREATE INDEX "SystemEmailTemplate_isFeatured_idx" ON "SystemEmailTemplate"("isFeatured");

-- CreateIndex
CREATE INDEX "_EmailToSystemEmailTemplate_B_index" ON "_EmailToSystemEmailTemplate"("B");

-- AddForeignKey
ALTER TABLE "SystemEmailTemplate" ADD CONSTRAINT "SystemEmailTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmailToSystemEmailTemplate" ADD CONSTRAINT "_EmailToSystemEmailTemplate_A_fkey" FOREIGN KEY ("A") REFERENCES "Email"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmailToSystemEmailTemplate" ADD CONSTRAINT "_EmailToSystemEmailTemplate_B_fkey" FOREIGN KEY ("B") REFERENCES "SystemEmailTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
