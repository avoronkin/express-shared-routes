var Route, RouteManager, _,
  __slice = [].slice;

_ = require('underscore');

Route = require('./route');

RouteManager = (function() {
  RouteManager.prototype.routeList = [];

  RouteManager.prototype.routeMap = {};

  function RouteManager(options) {
    this.options = options;
    this.route = new Route;
  }

  RouteManager.prototype.clear = function() {
    this.routeList = [];
    return this.routeMap = {};
  };

  RouteManager.prototype.exportRoutes = function() {
    return this.routeMap;
  };

  RouteManager.prototype.getRoute = function(name) {
    if (_.isObject(name)) {
      return name;
    }
    if (this.routeMap[name] == null) {
      throw new Error('Route ' + name + ' was not found');
    }
    return this.routeMap[name];
  };

  RouteManager.prototype.applyRoutes = function(pagejsApp) {
    var args, r, _i, _len, _ref, _results;
    _ref = this.routeList;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      r = _ref[_i];
      args = [this.route.getRe(r)].concat(r.cb);
      _results.push(pagejsApp.apply(pagejsApp, args));
    }
    return _results;
  };

  RouteManager.prototype.add = function(route, cb) {
    var r;
    this.routeMap[route.name] = _.clone(route);
    r = _.clone(route);
    if (cb.length > 0) {
      r.cb = cb;
    } else {
      if ((r.cb != null) && _.isFunction(r.cb)) {
        r.cb = [r.cb];
      }
      if ((r.handler != null) && _.isFunction(r.handler)) {
        if (r.mw != null) {
          if (_.isFunction(r.mw)) {
            r.cb = [r.mw];
          } else if (_.isArray(r.mw)) {
            r.cb = r.mw.slice(0);
          } else {
            throw new Error('Invalid middleware type');
          }
        } else {
          r.cb = [];
        }
        r.cb.push(r.handler);
      }
    }
    if ((r.cb == null) || !_.isArray(r.cb) || r.cb.length === 0) {
      throw new Error("Route " + route.name + " has invalid callback");
    }
    if ((this.options != null) && (this.options.injectToLocals != null)) {
      this.injectToLocals(r);
    }
    // r.method = method;
    var routeList = this.routeList.push(r);
    return routeList;
  };

  RouteManager.prototype.getMiddleware = function(route_name) {
    var r;
    r = this.routeMap[route_name];
    if (_.isFunction(r.mw)) {
      return [r.mw];
    }
    return r.mw;
  };

  RouteManager.prototype.injectToLocals = function(route) {
    var reqVar;
    reqVar = this.options.injectToLocals;
    return route.cb.unshift(function(req, res, next) {
      res.locals[reqVar] = route;
      return next();
    });
  };

  RouteManager.prototype.is = function(route, name) {
    var r;
    r = this.getRoute(route);
    return this.route.is(r, name);
  };

  RouteManager.prototype.isSonOf = function(route, name) {
    var r;
    r = this.getRoute(route);
    return this.route.isSonOf(r, name);
  };

  RouteManager.prototype.getLink = function(route, attr) {
    var r;
    r = this.getRoute(route);
    return this.route.getLink(r, attr);
  };

  return RouteManager;

})();

module.exports = RouteManager;

