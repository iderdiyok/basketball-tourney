export const HALF_TIME_DURATION_SECONDS = 300;
export const TOTAL_GAME_TIME_SECONDS = 2 * HALF_TIME_DURATION_SECONDS;

export const formatSecondsToMMSS = (totalSeconds: number): string => {
  const mins = Math.floor(Math.max(0, totalSeconds) / 60);
  const secs = Math.max(0, totalSeconds) % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};