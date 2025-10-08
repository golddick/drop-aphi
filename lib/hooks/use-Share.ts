"use client";

import { useCallback, useMemo } from "react";

type UseShareParams = {
  url: string;
  title: string;
  description?: string;
  image?: string;        // Featured image URL
  hashtags?: string[];
  via?: string;
};

type ShareLinks = {
  facebook: string;
  twitter: string;
  linkedin: string;
  whatsapp: string;
  copy: string;
};

export function useShare({
  url,
  title,
  description,
  image,
  hashtags = [],
  via,
}: UseShareParams) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(
    description ? `${title} – ${description}` : title
  );
  const encodedHashtags = hashtags.join(",");

  const links: ShareLinks = useMemo(
    () => ({
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}${
        encodedHashtags ? `&hashtags=${encodedHashtags}` : ""
      }${via ? `&via=${via}` : ""}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
      copy: url,
    }),
    [encodedUrl, encodedTitle, encodedText, encodedHashtags, via, url]
  );

  const open = useCallback(
    (platform: keyof ShareLinks) => {
      if (platform === "copy") {
        navigator.clipboard.writeText(url).catch(() => {});
        return;
      }
      window.open(links[platform], "_blank", "noopener,noreferrer");
    },
    [links, url]
  );

  const webShare = useCallback(async () => {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title,
          text: description ?? title,
          url,
          ...(image ? { files: [new File([], image)] } : {}),
        });
      } catch {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(url).catch(() => {});
    }
  }, [title, description, url, image]);

  return { links, open, webShare };
}


