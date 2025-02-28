"use client"

import { memo, useEffect, useLayoutEffect, useState } from "react"
import {
  AnimatePresence,
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from "framer-motion"

export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

type UseMediaQueryOptions = {
  defaultValue?: boolean
  initializeWithValue?: boolean
}

const IS_SERVER = typeof window === "undefined"

export function useMediaQuery(
  query: string,
  {
    defaultValue = false,
    initializeWithValue = true,
  }: UseMediaQueryOptions = {}
): boolean {
  const getMatches = (query: string): boolean => {
    if (IS_SERVER) {
      return defaultValue
    }
    return window.matchMedia(query).matches
  }

  const [matches, setMatches] = useState<boolean>(() => {
    if (initializeWithValue) {
      return getMatches(query)
    }
    return defaultValue
  })

  const handleChange = () => {
    setMatches(getMatches(query))
  }

  useIsomorphicLayoutEffect(() => {
    const matchMedia = window.matchMedia(query)
    handleChange()

    matchMedia.addEventListener("change", handleChange)

    return () => {
      matchMedia.removeEventListener("change", handleChange)
    }
  }, [query])

  return matches
}

const images = [
  "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
  "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
  "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
  "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
  "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
  "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
  "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
  "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
]

const duration = 0.15
const transition = { duration, ease: [0.32, 0.72, 0, 1], filter: "blur(4px)" }
const transitionOverlay = { duration: 0.5, ease: [0.32, 0.72, 0, 1] }

const Carousel = memo(
  ({
    images,
    handleClick,
    controls,
    isCarouselActive,
    handlePrev,
    handleNext,
  }: {
    images: string[]
    handleClick: (image: string, index: number) => void
    controls: any
    isCarouselActive: boolean
    handlePrev: () => void
    handleNext: () => void
  }) => {
    const isScreenSizeSm = useMediaQuery("(max-width: 640px)")
    const cylinderWidth = isScreenSizeSm ? 900 : 1400
    const faceCount = images.length
    const faceWidth = cylinderWidth / faceCount
    const radius = cylinderWidth / (2 * Math.PI)
    const rotation = useMotionValue(0)
    const transform = useTransform(
      rotation,
      (value) => `rotate3d(0, 1, 0, ${value}deg)`
    )

    return (
      <div
        className="flex h-full items-center justify-center relative"
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {/* Left navigation arrow */}
        <button
          onClick={handlePrev}
          className="absolute left-0 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 backdrop-blur-sm border border-white/10 transition-all duration-200 transform hover:scale-110"
          aria-label="Previous image"
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
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <motion.div
          drag={isCarouselActive ? "x" : false}
          className="relative flex h-full origin-center cursor-grab justify-center active:cursor-grabbing"
          style={{
            transform,
            rotateY: rotation,
            width: cylinderWidth,
            transformStyle: "preserve-3d",
          }}
          onDrag={(_, info) =>
            isCarouselActive &&
            rotation.set(rotation.get() + info.offset.x * 0.05)
          }
          onDragEnd={(_, info) =>
            isCarouselActive &&
            controls.start({
              rotateY: rotation.get() + info.velocity.x * 0.05,
              transition: {
                type: "spring",
                stiffness: 100,
                damping: 30,
                mass: 0.1,
              },
            })
          }
          animate={controls}
        >
          {images.map((image, i) => (
            <motion.div
              key={`key-${i}`}
              className="absolute flex h-full origin-center items-center justify-center rounded-xl p-2"
              style={{
                width: `${faceWidth}px`,
                transform: `rotateY(${
                  i * (360 / faceCount)
                }deg) translateZ(${radius}px)`,
              }}
              onClick={() => handleClick(image, i)}
            >
              <motion.div
                className="relative h-[280px] w-[280px] overflow-hidden rounded-lg shadow-2xl bg-mauve-dark-2 border border-white/10"
                layoutId={`img-container-${i}`}
              >
                <motion.img
                  src={image}
                  alt={`Image ${i}`}
                  layoutId={`img-${i}`}
                  className="pointer-events-none h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  initial={{ filter: "blur(4px)" }}
                  layout="position"
                  animate={{ filter: "blur(0px)" }}
                  transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
                />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Right navigation arrow */}
        <button
          onClick={handleNext}
          className="absolute right-0 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 backdrop-blur-sm border border-white/10 transition-all duration-200 transform hover:scale-110"
          aria-label="Next image"
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
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    )
  }
)

const hiddenMask = `repeating-linear-gradient(to right, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 30px, rgba(0,0,0,1) 30px, rgba(0,0,0,1) 30px)`
const visibleMask = `repeating-linear-gradient(to right, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 0px, rgba(0,0,0,1) 0px, rgba(0,0,0,1) 30px)`

export function ThreeDPhotoCarousel() {
  const [activeImage, setActiveImage] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [isCarouselActive, setIsCarouselActive] = useState(true)
  const controls = useAnimation()

  const handleClick = (image: string, index: number) => {
    setActiveImage(image)
    setActiveIndex(index)
    setIsCarouselActive(false)
    controls.stop()
  }

  const handleClose = () => {
    setActiveImage(null)
    setActiveIndex(null)
    setIsCarouselActive(true)
  }

  const handlePrev = () => {
    const newIndex =
      activeIndex === null
        ? images.length - 1
        : activeIndex === 0
        ? images.length - 1
        : activeIndex - 1

    setActiveIndex(newIndex)
    controls.start({
      rotateY: newIndex * (360 / images.length),
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 30,
      },
    })
  }

  const handleNext = () => {
    const newIndex =
      activeIndex === null
        ? 1
        : activeIndex === images.length - 1
        ? 0
        : activeIndex + 1

    setActiveIndex(newIndex)
    controls.start({
      rotateY: newIndex * (360 / images.length),
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 30,
      },
    })
  }

  return (
    <motion.div layout className="relative">
      <AnimatePresence mode="sync">
        {activeImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            layoutId={`img-container-${activeIndex}`}
            layout="position"
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-5"
            style={{ willChange: "opacity" }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="max-w-2xl w-full overflow-hidden rounded-xl shadow-2xl">
              <motion.img
                layoutId={`img-${activeIndex}`}
                src={activeImage}
                alt={`Image ${activeIndex}`}
                className="w-full h-auto object-contain"
                style={{ willChange: "transform" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative h-[420px] w-full overflow-hidden">
        <Carousel
          images={images}
          handleClick={handleClick}
          controls={controls}
          isCarouselActive={isCarouselActive}
          handlePrev={handlePrev}
          handleNext={handleNext}
        />
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-[-30px] left-0 right-0 flex justify-center gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setActiveIndex(index)
              controls.start({
                rotateY: index * (360 / images.length),
                transition: {
                  type: "spring",
                  stiffness: 100,
                  damping: 30,
                },
              })
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              activeIndex === index
                ? "bg-[#BFB28F] w-4" // Make active dot wider
                : "bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </motion.div>
  )
}
