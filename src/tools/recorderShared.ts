/** Pick the best recording format this browser supports. */
export function pickMime(kind: 'video' | 'audio'): { mime: string; ext: string } {
  const options = kind === 'video'
    ? [['video/mp4;codecs=avc1', 'mp4'], ['video/webm;codecs=vp9,opus', 'webm'], ['video/webm;codecs=vp8,opus', 'webm'], ['video/webm', 'webm'], ['video/mp4', 'mp4']]
    : [['audio/mp4', 'm4a'], ['audio/webm;codecs=opus', 'webm'], ['audio/webm', 'webm'], ['audio/ogg;codecs=opus', 'ogg']];
  if (typeof MediaRecorder === 'undefined') return { mime: '', ext: kind === 'video' ? 'webm' : 'webm' };
  for (const [m, e] of options) if (MediaRecorder.isTypeSupported(m)) return { mime: m, ext: e };
  return { mime: '', ext: 'webm' };
}

export const stamp = () => new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
