'use client'

import { useState } from "react"
import Image from "next/image"
import { Play } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type MediaItem = {
  url: string
  type: 'image' | 'video'
  alt?: string
}

export function MediaGallery({ 
  images = [], 
  video = null 
}: { 
  images?: string[], 
  video?: string | null 
}) {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  // Convert props to MediaItem array
  const mediaItems: MediaItem[] = [
    ...images.map(url => ({ url, type: 'image' as const })),
    ...(video ? [{ url: video, type: 'video' as const }] : [])
  ]

  const openMedia = (media: MediaItem) => {
    setSelectedMedia(media)
    setIsOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeMedia = () => {
    setIsOpen(false)
    document.body.style.overflow = 'auto'
  }

  if (mediaItems.length === 0) return null

  console.log(mediaItems,'mediaItems', 'Media Items')

  return (
    <div className="my-6">
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {mediaItems.map((media, index) => (
          <div
            key={index}
            // whileHover={{ scale: 1.02 }}
            // whileTap={{ scale: 0.98 }}
            // className="relative aspect-square cursor-pointer rounded-lg overflow-hidden shadow-sm"
            className="relative  cursor-pointer rounded-lg overflow-hidden shadow-sm"
            onClick={() => openMedia(media)}
          >
            {media.type === 'image' ? (
                <div className="relative  bg-blue-400 w-full h-[150px] ">

              <Image
                src={media.url}
                alt={media.alt || ''}
                fill
                className="object-cover absolute "
              />
                  </div>
            ) : (
              <div className="relative h-full w-full bg-black/50 flex items-center justify-center">
                {/* For videos, we can use the first frame or a placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="h-8 w-8 text-white fill-current" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal for expanded view */}
      <AnimatePresence>
        {isOpen && selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeMedia}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl w-full max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeMedia}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                aria-label="Close media viewer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>

              <div className="bg-black rounded-lg overflow-hidden">
                {selectedMedia.type === 'image' ? (
                  <Image
                    src={selectedMedia.url}
                    alt={selectedMedia.alt || ''}
                    width={1200}
                    height={800}
                    className="w-full h-auto max-h-[80vh] object-contain"
                  />
                ) : (
                  <div className="aspect-video w-full">
                    <video
                      src={selectedMedia.url}
                      controls
                      autoPlay
                      className="w-full h-full object-contain max-h-[80vh]"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}