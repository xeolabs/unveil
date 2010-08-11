uv.Resource = function(g, key, data) {
  uv.Node.call(this);
  
  this.g = g;
  this.key = key;
  this.type = g.get('types', data.type);
  // memoize raw data for the build process
  this.data = data;
};

uv.Resource.prototype = Object.extend(uv.Node);

uv.Resource.prototype.build = function() {
  var that = this;
  _.each(this.data.properties, function(property, key) {
    
    // Ask the schema wheter this property holds a
    // value type or an object type
    var values = _.isArray(property) ? property : [property];
    var p = that.type.get('properties', key);
    
    if (p.isObjectType()) {
      _.each(values, function(v, index) {
        var res = that.g.get('resources', v);
        that.set(p.key, res.key, res);
      });
    } else {
      _.each(values, function(v, index) {
        var val = p.get('values', v);
        // look if this value is already registerd
        // on this property
        if (!val) {
          val = new uv.Node({value: v});
        }
        that.set(p.key, v, val);
        p.set('values', v, val);
      });
    }
  });
};

// Delegates to Node#get if 3 arguments are provided
uv.Resource.prototype.get = function(property, key) {
  var p = this.type.get('properties', property);
  if (!p) return null;
  
  if (arguments.length === 1) {
    if (p.isObjectType()) {
      return p.unique ? this.first(property) : this.all(property);
    } else {
      return p.unique ? this.value(property) : this.values(property);
    }
  } else {
    return uv.Node.prototype.get.call(this, property, key);
  }
};