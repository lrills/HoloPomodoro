const currentDayId = (hourOffset: number): string => {
  const date = new Date();
  date.setUTCHours(date.getUTCHours() + hourOffset);

  return date.toISOString().slice(0, 10);
};

export default currentDayId;
