-- AddForeignKey
ALTER TABLE "platform_subscribers" ADD CONSTRAINT "platform_subscribers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
