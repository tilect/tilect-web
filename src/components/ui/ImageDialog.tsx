"use client";

import { useCallback, useEffect, useRef } from "react";

export type ImageDialogProps = {
  /** Image source URL. */
  src: string;
  /** Accessible alt text. */
  alt: string;
  /** Whether the dialog is open. */
  open: boolean;
  /** Called when the dialog should close. */
  onClose: () => void;
};

/**
 * ImageDialog — fullscreen image viewer using the native <dialog> element.
 * Supports pinch-to-zoom on mobile natively through the browser.
 *
 * @example
 * <ImageDialog src="/image.jpg" alt="Photo" open={isOpen} onClose={() => setIsOpen(false)} />
 */
export function ImageDialog({ src, alt, open, onClose }: ImageDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        onClose();
      }
    },
    [onClose],
  );

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onClose={onClose}
      className="fixed inset-0 m-0 h-dvh max-h-dvh w-dvw max-w-dvw bg-black/90 p-0 backdrop:bg-transparent"
    >
      {open && (
        <div className="flex h-full w-full items-center justify-center p-4">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Close"
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      )}
    </dialog>
  );
}
