/* eslint-disable @next/next/no-img-element */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

type GalleryImage = string | null | undefined;

interface ImageGalleryProps {
  images: GalleryImage[];
  onClick?: (index: number) => void;
}

export const ImageGallery = ({ images, onClick }: ImageGalleryProps) => {
  return (
    <div className="flex justify-start gap-2 px-2 py-1 overflow-x-scroll">
      {images.map((img, index) => {
        if (!img) {
          return null;
        }
        return (
          <Dialog>
            <DialogTrigger onClick={() => onClick?.(index)}>
              <div className="relative min-w-[60px] min-h-[60px] max-w-[300px] max-h-[300px] border rounded-lg my-2 cursor-zoom-in">
                <img
                  className="rounded-md object-contain size-full"
                  src={img}
                  alt="message image"
                />
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-[800px] border-none bg-transparent p0 shadow-none">
              <DialogTitle className="hidden"></DialogTitle>
              <DialogDescription className="hidden"></DialogDescription>

              <img
                className="rounded-md object-cover size-full"
                src={img}
                alt="message image"
              />
            </DialogContent>
          </Dialog>
        );
      })}
    </div>
  );
};
