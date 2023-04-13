import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import { Box, IconButton } from '@mui/material';
import { useEffect, useState } from 'react';
export interface TimerEvent {
  type: TimerEventType;
  timestamp_ms: number;
  questionIdx?: number;
}

export enum TimerEventType {
  SWITCH,
  PAUSE,
  UNPAUSE,
  SUBMIT,
}

export function timerEvent(
  type: TimerEventType,
  questionIdx?: number
): TimerEvent {
  return {
    timestamp_ms: Date.now(),
    type,
    questionIdx,
  };
}

function getTotalElapsedTime(events: TimerEvent[]) {
  if (!events?.length) return 0;
  console.assert(events[0].type === TimerEventType.SWITCH);
  let isPaused = false;
  let lastStartTime_ms: undefined | number = events[0].timestamp_ms;
  let totalTime = 0;
  for (const e of events) {
    switch (e.type) {
      case TimerEventType.PAUSE:
      case TimerEventType.SUBMIT:
        isPaused = true;
        if (lastStartTime_ms) totalTime += e.timestamp_ms - lastStartTime_ms;
        lastStartTime_ms = undefined;
        break;
      case TimerEventType.UNPAUSE:
        isPaused = false;
        lastStartTime_ms = e.timestamp_ms;
        break;
      case TimerEventType.SWITCH:
        isPaused = false;
        if (!lastStartTime_ms) lastStartTime_ms = e.timestamp_ms;
        break;
    }
  }
  if (!isPaused && lastStartTime_ms) {
    totalTime += Date.now() - lastStartTime_ms;
  }
  return totalTime;
}

function getElapsedTime(events: TimerEvent[], questionIdx: number) {
  if (!events?.length) return 0;
  console.assert(events[0].type === TimerEventType.SWITCH);
  let isPaused = false;
  let lastStartTime_ms: undefined | number = events[0].timestamp_ms;
  let totalTime = 0;
  let currentQuestionIdx = events[0].questionIdx;
  for (const e of events) {
    const wasThisQuestion = currentQuestionIdx === questionIdx;
    switch (e.type) {
      case TimerEventType.PAUSE:
      case TimerEventType.SUBMIT:
        isPaused = true;
        if (wasThisQuestion && lastStartTime_ms)
          totalTime += e.timestamp_ms - lastStartTime_ms;
        lastStartTime_ms = undefined;
        break;
      case TimerEventType.UNPAUSE:
        isPaused = false;
        if (wasThisQuestion) lastStartTime_ms = e.timestamp_ms;
        break;
      case TimerEventType.SWITCH:
        isPaused = false;
        if (wasThisQuestion) {
          if (lastStartTime_ms) totalTime += e.timestamp_ms - lastStartTime_ms;
          lastStartTime_ms = undefined;
        }
        if (e.questionIdx === questionIdx) lastStartTime_ms = e.timestamp_ms;
        currentQuestionIdx = e.questionIdx;
    }
  }
  if (
    (!questionIdx || currentQuestionIdx === questionIdx) &&
    !isPaused &&
    lastStartTime_ms
  ) {
    totalTime += Date.now() - lastStartTime_ms;
  }
  return totalTime;
}

const formatElapsedTime = (ms: number): string => {
  const tenths = Math.floor((ms % 1000) / 100);
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  const displaySeconds = seconds % 60;
  const displayMinutes = minutes % 60;
  const displayHours = hours % 24;

  const hourSection = seconds >= 3600 ? `${displayHours.toString()}:` : '';
  const minuteSection =
    seconds >= 60 ? `${displayMinutes.toString().padStart(2, '0')}:` : '';
  const secondSection = displaySeconds.toString().padStart(2, '0');
  return hourSection + minuteSection + secondSection + '.' + tenths;
};

export function QuizTimer({
  events,
  onPause,
  onUnpause,
}: {
  events: TimerEvent[];
  onPause?: () => void;
  onUnpause?: () => void;
}) {
  const isPaused =
    !!events?.length && events[events.length - 1].type === TimerEventType.PAUSE;
  return (
    <Box
      display="flex"
      alignItems="center"
      border="1px solid #CCC"
      borderRadius="5px"
      height="fit-content"
      pl="10px"
    >
      <Box fontSize="24px">
        <Timer events={events} />
      </Box>
      <IconButton
        onClick={() => {
          if (!onPause || !onUnpause) return;
          if (isPaused) onUnpause();
          else onPause();
        }}
      >
        {isPaused ? (
          <PlayCircleIcon fontSize="large" />
        ) : (
          <PauseCircleIcon fontSize="large" />
        )}
      </IconButton>
    </Box>
  );
}

export function Timer({
  events,
  questionIndex,
}: {
  events: TimerEvent[];
  questionIndex?: number;
}) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const et =
        questionIndex === undefined
          ? getTotalElapsedTime(events)
          : getElapsedTime(events, questionIndex);
      setElapsedTime(et);
    }, 100);

    return () => clearInterval(intervalId);
  }, [events, questionIndex]);

  return (
    <span style={{ color: 'gray', fontFamily: 'monospace' }}>
      {formatElapsedTime(elapsedTime)}
    </span>
  );
}
