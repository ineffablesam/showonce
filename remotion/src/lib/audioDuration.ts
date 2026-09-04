import { getAudioDurationInSeconds } from '@remotion/media-utils'

/**
 * Reads a static audio file's real duration so compositions can size
 * themselves automatically once you drop in the ElevenLabs output —
 * nothing to hand-measure or guess.
 *
 * Falls back to `fallbackSeconds` (and logs a warning) if the file isn't
 * there yet, so `remotion studio` still opens cleanly before you've
 * generated audio.
 */
export async function safeAudioDuration(
  src: string,
  fallbackSeconds: number,
): Promise<number> {
  try {
    const duration = await getAudioDurationInSeconds(src)
    if (!Number.isFinite(duration) || duration <= 0) return fallbackSeconds
    return duration
  } catch (error) {
    console.warn(
      `[audioDuration] Could not read "${src}" yet — using ${fallbackSeconds}s placeholder. ` +
        'Drop the real ElevenLabs file in remotion/public/audio/ to fix.',
      error,
    )
    return fallbackSeconds
  }
}
