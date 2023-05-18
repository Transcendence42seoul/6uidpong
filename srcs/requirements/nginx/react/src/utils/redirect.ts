const redirect = (
  pathname: string,
  { origin } = new URL(window.location.href),
) => {
  window.location.replace(origin + pathname);
};

export default redirect;
