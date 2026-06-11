export const socketStats = {
  onlineSockets: 0,
  waitingVideo: 0,
  waitingText: 0,
  activePairs: 0,
  totalMatches: 0,
  matchesToday: 0,
  lastMatchAt: null as Date | null,
  dayStarted: new Date().toDateString(),
};

export function recordMatch() {
  const today = new Date().toDateString();
  if (socketStats.dayStarted !== today) {
    socketStats.matchesToday = 0;
    socketStats.dayStarted = today;
  }
  socketStats.totalMatches++;
  socketStats.matchesToday++;
  socketStats.lastMatchAt = new Date();
}

export function updateQueueStats(waitingVideo: number, waitingText: number, activePairs: number, online: number) {
  socketStats.waitingVideo = waitingVideo;
  socketStats.waitingText = waitingText;
  socketStats.activePairs = activePairs;
  socketStats.onlineSockets = online;
}
