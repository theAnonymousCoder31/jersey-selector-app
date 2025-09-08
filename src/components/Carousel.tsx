"use client";

import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "../components/ui/Carousel";
import { JerseyCard } from "./JerseyCard";
import { Jersey } from "../types/jersey";

interface JerseyCarouselProps {
  jerseys: Jersey[];
  selectedJerseyId: string | null;
  onSelectJersey: (id: string) => void;
}

export const JerseyCarousel = ({
  jerseys,
  selectedJerseyId,
  onSelectJersey,
}: JerseyCarouselProps) => {
  const [carouselApi, setCarouselApi] = useState<any>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Update selectedIndex when Embla scrolls
  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => setSelectedIndex(carouselApi.selectedScrollSnap());
    onSelect();

    carouselApi.on("select", onSelect);
    carouselApi.on("reInit", onSelect);

    return () => {
      carouselApi.off("select", onSelect);
      carouselApi.off("reInit", onSelect);
    };
  }, [carouselApi]);

  return (
    <div className="relative w-full">
      <Carousel
        opts={{
          align: "center", // active card always centered
          skipSnaps: false,
          loop: false,
        }}
        setApi={setCarouselApi}
      >
        <CarouselContent className="flex gap-4 px-2 md:px-4 lg:px-6">
          {jerseys.map((jersey) => (
            <CarouselItem
              key={jersey.id}
              className="flex-shrink-0 basis-full sm:basis-full md:basis-1/2 lg:basis-1/3"
            >
              <div className="px-1 md:px-2 lg:px-3">
                <JerseyCard
                  jersey={jersey}
                  isSelected={jersey.id === selectedJerseyId}
                  onSelect={onSelectJersey}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation buttons */}
        <CarouselPrevious className="absolute top-1/2 -left-6 -translate-y-1/2" />
        <CarouselNext className="absolute top-1/2 -right-6 -translate-y-1/2" />
      </Carousel>

      {/* Indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {jerseys.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors duration-200 ${
              index === selectedIndex ? "bg-yellow-500" : "bg-gray-400"
            }`}
            onClick={() => carouselApi?.scrollTo(index)}
            aria-label={`Go to jersey ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
