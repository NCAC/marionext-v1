type _routeToRegExp = ((route: string) => RegExp);
const _routeToRegExp = (function () {
  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  const optionalParam = /\((.*?)\)/g;
  const namedParam = /(\(\?)?:\w+/g;
  const splatParam = /\*\w+/g;
  const escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;

  return function (route: string) {

    route = route.replace(escapeRegExp, "\\$&")
      .replace(optionalParam, "(?:$1)?")
      .replace(namedParam, function (match, optional) {
        return optional ? match : "([^/?]+)";
      })
      .replace(splatParam, "([^?]*?)");
    return new RegExp("^" + route + "(?:\\?([\\s\\S]*))?$");
  };

}());

export { _routeToRegExp };
