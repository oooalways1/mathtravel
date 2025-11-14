import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';

interface UseBgmOptions {
  play?: boolean;
  volume?: number;
}

/**
 * 페이지/모드별 배경 음악을 제어하는 훅
 * src가 null이면 아무 작업도 하지 않습니다.
 */
export const useBgm = (src: string | null, options: UseBgmOptions = {}) => {
  const { play = true, volume = 0.4 } = options;
  const musicEnabled = useGameStore((state) => state.settings.musicEnabled);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const srcRef = useRef<string | null>(null);

  useEffect(() => {
    if (!src) {
      audioRef.current?.pause();
      srcRef.current = null;
      return;
    }

    if (!audioRef.current || srcRef.current !== src) {
      audioRef.current?.pause();

      const audio = new Audio(src);
      audio.loop = true;
      audio.volume = volume;

      audioRef.current = audio;
      srcRef.current = src;
    } else if (audioRef.current) {
      audioRef.current.volume = volume;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (musicEnabled && play) {
      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch(() => {
          // 자동재생이 차단되더라도 오류를 노출하지 않음
        });
      }
    } else {
      audio.pause();
      audio.currentTime = 0;
    }

    return () => {
      audio.pause();
    };
  }, [src, musicEnabled, play, volume]);
};


