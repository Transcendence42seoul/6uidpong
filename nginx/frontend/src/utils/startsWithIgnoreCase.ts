const startsWithIgnoreCase = (string: string, searchTerm: string) => {
  return string.toLowerCase().startsWith(searchTerm.toLowerCase());
};

export default startsWithIgnoreCase;
