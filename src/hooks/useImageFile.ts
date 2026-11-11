import { useCallback, useEffect, useRef, useState } from 'react';
import { decodeImage, releaseImage, type DecodedImage } from '../lib/image';
import { checkFile } from '../utils/files';
import { limits } from '../config/limits';
import { useToast } from '../components/ui/Toast';

/** Selects, validates and decodes a single image. Releases decoded memory on change/unmount. */
export function useImageFile(accept: { mime: string[]; ext: string[] }) {
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<DecodedImage | null>(null);
  const [loading, setLoading] = useState(false);
  const imageRef = useRef<DecodedImage | null>(null);

  useEffect(() => () => releaseImage(imageRef.current), []);

  const select = useCallback(
    async (files: File[]) => {
      const f = files[0];
      if (!f) return;
      const check = checkFile(f, { accept, maxBytes: limits.imageMaxFileBytes, label: 'image' });
      if (!check.ok) {
        toast.error(check.error!);
        return;
      }
      setLoading(true);
      try {
        const decoded = await decodeImage(f);
        releaseImage(imageRef.current);
        imageRef.current = decoded;
        setImage(decoded);
        setFile(f);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'This image could not be opened.');
      } finally {
        setLoading(false);
      }
    },
    [accept, toast],
  );

  const clear = useCallback(() => {
    releaseImage(imageRef.current);
    imageRef.current = null;
    setImage(null);
    setFile(null);
  }, []);

  return { file, image, loading, select, clear };
}
