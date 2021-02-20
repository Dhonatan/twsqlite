export default function hasIn(prop, obj) {
  if (obj === undefined) {
    return function(obj) {
      return hasIn(prop, obj);
    };
  }

  return prop in obj;
}
