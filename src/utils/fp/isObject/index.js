const isObject = maybeObject => {
  return (
    maybeObject !== null &&
    typeof maybeObject === 'object' &&
    !Array.isArray(maybeObject)
  );
};

export default isObject;
