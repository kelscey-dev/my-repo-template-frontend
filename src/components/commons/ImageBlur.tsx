"use client";

import Image, { ImageProps } from "next/image";
import { useInView } from "react-intersection-observer";
import { twMerge } from "tailwind-merge";

export default function ImageBlur({
  containerClass,
  ...imageProps
}: {
  containerClass?: string;
} & ImageProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  return (
    <div className={twMerge(containerClass, "relative")} ref={ref}>
      <Image
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
        {...imageProps}
        alt={imageProps.alt}
        className={twMerge(
          "transition duration-300 object-contain object-center !relative",
          inView ? "opacity-100" : "opacity-0",
          imageProps.className
        )}
      />
    </div>
  );
}
