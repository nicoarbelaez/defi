const isValidRange = (value: string): boolean => {
  const rangePattern = /^[A-Za-z]+\d+(:[A-Za-z]+\d+)?$/;
  return rangePattern.test(value);
};
