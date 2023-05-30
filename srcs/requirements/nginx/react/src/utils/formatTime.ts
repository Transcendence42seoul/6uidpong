const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString('ko-KR', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
};

export default formatTime;
