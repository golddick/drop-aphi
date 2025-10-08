import { getServerAuth } from "@/lib/auth/getauth";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  blogFeaturedImg: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const user = await getServerAuth();
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url || file.ufsUrl);

      return {
        uploadedBy: metadata.userId,
        fileUrl:  file.ufsUrl || file.url,
      };
    }),
  blogGalleryImg: f({
    image: {
      maxFileSize: '128MB',
      maxFileCount: 6,
    },
  })
    .middleware(async ({ req }) => {
   const user = await getServerAuth();
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.ufsUrl);

      return {
        uploadedBy: metadata.userId,
        fileUrl:  file.ufsUrl || file.url,
      };
    }),

  blogVideoUpload: f({
    video: {
      maxFileSize: '1GB',
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
     const user = await getServerAuth();
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url || file.ufsUrl);

      return {
        uploadedBy: metadata.userId,
        fileUrl:  file.ufsUrl || file.url,
      };
    }),
  videoUploader: f({
    video: {
      maxFileSize: "64MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
     const user = await getServerAuth();
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url || file.ufsUrl);

      return {
        uploadedBy: metadata.userId,
        fileUrl:  file.ufsUrl || file.url,
      };
    }),


 kycDocument: f({
    image: { maxFileSize: "4MB", maxFileCount: 3 },
    pdf: { maxFileSize: "4MB", maxFileCount: 3 },
  })
    .middleware(async () => {
      const user = await getServerAuth();
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("KYC Upload complete for:", metadata.userId);
      console.log("File URL:", file.ufsUrl || file.url);
      console.log("File Type:", file.type);

      return {
        uploadedBy: metadata.userId,
        fileUrl: file.ufsUrl || file.url,
        fileType: file.type,
      };
    }),




imageUploader: f({
  image: { maxFileSize: "4MB", maxFileCount: 3 },
  pdf: { maxFileSize: "4MB", maxFileCount: 3 },
})
  .middleware(async () => {
    const user = await getServerAuth();
    if (!user) throw new UploadThingError("Unauthorized");
    return { userId: user.userId };
  })
  .onUploadComplete(async ({ metadata, file }) => {
    // Don't create database record here, just return the file info
    // The email creation process will handle database association later

    return {
      uploadedBy: metadata.userId,
      fileUrl: file.ufsUrl || file.url,
      fileType: file.type,
      filename: file.name,
      fileSize: file.size,
    };
  }),



} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;


  
