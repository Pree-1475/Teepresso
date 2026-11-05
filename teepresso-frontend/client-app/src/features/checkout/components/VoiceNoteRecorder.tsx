'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import styles from './VoiceNoteRecorder.module.css';

interface VoiceNoteRecorderProps {
  onVoiceNoteChange: (dataUrl: string | null, durationSeconds: number) => void;
}

const MAX_RECORDING_SECONDS = 180; // 3 minutes maximum cap

export function VoiceNoteRecorder({ onVoiceNoteChange }: VoiceNoteRecorderProps) {
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'recorded' | 'error'>('idle');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up timer and streams on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 1. START RECORDING (Requests microphone permission on click)
  const startRecording = async () => {
    setErrorMessage(null);
    audioChunksRef.current = [];

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setRecordingState('error');
      setErrorMessage('Audio recording not supported');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const localPreviewUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(localPreviewUrl);

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          onVoiceNoteChange(base64Data, elapsedTime || recordedDuration);
        };
        reader.readAsDataURL(audioBlob);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      recorder.start(250);
      setRecordingState('recording');
      setElapsedTime(0);

      timerIntervalRef.current = setInterval(() => {
        setElapsedTime(prev => {
          const next = prev + 1;
          if (next >= MAX_RECORDING_SECONDS) {
            stopRecording();
            return MAX_RECORDING_SECONDS;
          }
          return next;
        });
      }, 1000);

    } catch (err: any) {
      console.error('Microphone access error:', err);
      setRecordingState('error');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Mic permission denied');
      } else {
        setErrorMessage('Mic unavailable');
      }
    }
  };

  // 2. STOP RECORDING
  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    setRecordedDuration(elapsedTime);
    setRecordingState('recorded');
  };

  // 3. DELETE RECORDING
  const deleteRecording = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setIsPlaying(false);
    setPlaybackProgress(0);
    setElapsedTime(0);
    setRecordedDuration(0);
    setRecordingState('idle');
    setErrorMessage(null);
    onVoiceNoteChange(null, 0);
  };

  // 4. PLAY / PAUSE PREVIEW
  const togglePlayPause = () => {
    if (!audioPlayerRef.current) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error('Audio playback error:', err));
    }
  };

  const handleTimeUpdate = () => {
    if (!audioPlayerRef.current) return;
    const current = audioPlayerRef.current.currentTime;
    const duration = audioPlayerRef.current.duration || recordedDuration || 1;
    setPlaybackProgress((current / duration) * 100);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setPlaybackProgress(0);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.currentTime = 0;
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioPlayerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = Math.max(0, Math.min(1, clickX / rect.width));
    const duration = audioPlayerRef.current.duration || recordedDuration;
    audioPlayerRef.current.currentTime = newProgress * duration;
    setPlaybackProgress(newProgress * 100);
  };

  return (
    <div className={styles.container}>
      {/* Hidden audio player for preview */}
      {audioUrl && (
        <audio
          ref={audioPlayerRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleAudioEnded}
          preload="metadata"
        />
      )}

      {/* STATE 1: IDLE - Title and Standalone Mic Button */}
      {recordingState === 'idle' && (
        <div className={styles.idleRow}>
          <span className={styles.title}>Add a Voice Note</span>
          <button
            type="button"
            className={styles.micBtn}
            onClick={startRecording}
            title="Record Voice Note"
            aria-label="Record Voice Note"
          >
            <Mic size={17} />
          </button>
        </div>
      )}

      {/* STATE 2: RECORDING */}
      {recordingState === 'recording' && (
        <div className={styles.recordingWrapper}>
          <div className={styles.recordingStatus}>
            <div className={styles.pulsingDot} />
            <span className={styles.timerText}>{formatTime(elapsedTime)}</span>
            <span className={styles.recordingLabel}>Recording...</span>
          </div>
          <button
            type="button"
            className={styles.stopBtn}
            onClick={stopRecording}
            title="Stop & Save"
            aria-label="Stop & Save"
          >
            <Square size={13} fill="#FFFFFF" />
          </button>
        </div>
      )}

      {/* STATE 3: RECORDED */}
      {recordingState === 'recorded' && (
        <div className={styles.recordedWrapper}>
          <div className={styles.playerRow}>
            <button
              type="button"
              className={styles.playBtn}
              onClick={togglePlayPause}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={15} /> : <Play size={15} style={{ marginLeft: 2 }} />}
            </button>

            <div className={styles.waveformArea}>
              <div className={styles.progressBarContainer} onClick={handleProgressClick}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: `${playbackProgress}%` }}
                />
              </div>
              <div className={styles.timeDisplay}>
                <span>
                  {audioPlayerRef.current
                    ? formatTime(audioPlayerRef.current.currentTime)
                    : '0:00'}
                </span>
                <span>{formatTime(recordedDuration)}</span>
              </div>
            </div>
          </div>

          <div className={styles.actionsRow}>
            <div className={styles.statusIndicator}>
              <CheckCircle size={13} />
              <span>Voice note ready</span>
            </div>
            <div className={styles.actionBtns}>
              <button
                type="button"
                className={styles.reRecordBtn}
                onClick={() => {
                  deleteRecording();
                  startRecording();
                }}
              >
                <RefreshCw size={11} />
                <span>Re-record</span>
              </button>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={deleteRecording}
              >
                <Trash2 size={11} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATE 4: PERMISSION / ERROR */}
      {recordingState === 'error' && (
        <div className={styles.errorWrapper}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={15} />
            {errorMessage || 'Mic unavailable'}
          </span>
          <button
            type="button"
            className={styles.retryBtn}
            onClick={() => {
              setRecordingState('idle');
              setErrorMessage(null);
            }}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}

export default VoiceNoteRecorder;
