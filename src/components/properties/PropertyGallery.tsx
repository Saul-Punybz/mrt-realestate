import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Grid, Maximize2 } from 'lucide-react';

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export default function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setShowGrid(false);
    document.body.style.overflow = '';
  };

  return (
    <>
      {/* Main Gallery */}
      <div className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-4 gap-2 h-[500px]">
          {/* Main Image */}
          <div
            className="col-span-4 md:col-span-2 md:row-span-2 relative cursor-pointer group"
            onClick={() => openLightbox(0)}
          >
            <img
              src={images[0]}
              alt={`${title} - Imagen 1`}
              className="w-full h-full object-cover rounded-l-xl"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-l-xl" />
            <button className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-4 h-4" />
              Ver más
            </button>
          </div>

          {/* Secondary Images */}
          {images.slice(1, 5).map((image, index) => (
            <div
              key={index}
              className={`hidden md:block relative cursor-pointer group ${
                index === 1 ? 'rounded-tr-xl' : index === 3 ? 'rounded-br-xl' : ''
              } overflow-hidden`}
              onClick={() => openLightbox(index + 1)}
            >
              <img
                src={image}
                alt={`${title} - Imagen ${index + 2}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              {index === 3 && images.length > 5 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    +{images.length - 5} fotos
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile: Show all button */}
        <button
          onClick={() => openLightbox(0)}
          className="mt-4 w-full md:hidden bg-white py-3 rounded-lg border flex items-center justify-center gap-2"
        >
          <Grid className="w-4 h-4" />
          Ver todas las fotos ({images.length})
        </button>
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
            <span className="text-white">
              {currentIndex + 1} / {images.length}
            </span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <Grid className="w-6 h-6" />
              </button>
              <button
                onClick={closeLightbox}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {showGrid ? (
            /* Grid View */
            <div className="h-full overflow-y-auto pt-16 pb-8 px-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square cursor-pointer"
                    onClick={() => {
                      setCurrentIndex(index);
                      setShowGrid(false);
                    }}
                  >
                    <img
                      src={image}
                      alt={`${title} - Imagen ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Slideshow View */
            <div className="h-full flex items-center justify-center">
              <img
                src={images[currentIndex]}
                alt={`${title} - Imagen ${currentIndex + 1}`}
                className="max-h-full max-w-full object-contain"
              />

              {/* Navigation Arrows */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-8 h-8 text-white" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </button>
            </div>
          )}

          {/* Thumbnail Strip */}
          {!showGrid && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
              <div className="flex gap-2 justify-center overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                      currentIndex === index ? 'border-white' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
