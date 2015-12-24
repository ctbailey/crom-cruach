var DrunkenWalk, calculateGrowth, clamp, getCap, grow, line, mix, mixRGB, random, regularDistribution, turn;

regularDistribution = function(options) {
  var addValue, inclusive, j, k, max, min, range, results, results1, samples, width;
  samples = options.samples, min = options.min, max = options.max, inclusive = options.inclusive;
  if (inclusive == null) {
    inclusive = true;
  }
  width = max - min;
  addValue = function(i) {
    return min + (width * (i / samples));
  };
  range = inclusive ? (function() {
    results = [];
    for (var j = 0; 0 <= samples ? j <= samples : j >= samples; 0 <= samples ? j++ : j--){ results.push(j); }
    return results;
  }).apply(this) : (function() {
    results1 = [];
    for (var k = 1; 1 <= samples ? k < samples : k > samples; 1 <= samples ? k++ : k--){ results1.push(k); }
    return results1;
  }).apply(this);
  return range.map(addValue);
};

random = function(min, max) {
  var dist;
  dist = max - min;
  return min + (Math.random() * dist);
};

clamp = function(n, min, max) {
  if (min != null) {
    n = Math.max(n, min);
  }
  if (max != null) {
    n = Math.min(n, max);
  }
  return n;
};

DrunkenWalk = function(options) {
  var max, min, noiseAmplitude, noiseMax, noiseMin, ref, startingValue;
  startingValue = options.startingValue, noiseAmplitude = options.noiseAmplitude, (ref = options.clamp, min = ref.min, max = ref.max);
  noiseMax = noiseAmplitude / 2;
  noiseMin = -noiseMax;
  this.previousValue = startingValue;
  return {
    next: (function(_this) {
      return function() {
        var currentValue;
        currentValue = _this.previousValue + random(noiseMin, noiseMax);
        currentValue = clamp(currentValue, min, max);
        _this.previousValue = currentValue;
        return currentValue;
      };
    })(this)
  };
};

line = function(p1, p2) {
  var slope;
  slope = (p2.y - p1.y) / (p2.x - p1.x);
  return function(x) {
    return slope * (x - p1.x) + p1.y;
  };
};

mix = function(a, b, proportion) {
  var inverseProportion;
  inverseProportion = 1 - proportion;
  return (a * proportion) + (b * inverseProportion);
};

mixRGB = function(color1, color2, proportion) {
  var newColor;
  newColor = color1.clone();
  newColor.red = mix(color1.red, color2.red, proportion);
  newColor.blue = mix(color1.blue, color2.blue, proportion);
  newColor.green = mix(color1.green, color2.green, proportion);
  return newColor;
};

getCap = function() {
  var beginning, cap, direction, end, mid, radius;
  beginning = this.firstSegment.point;
  end = this.lastSegment.point;
  cap = end.subtract(beginning);
  radius = cap.length / 2;
  mid = beginning.add(cap.divide(2));
  direction = cap.normalize();
  direction.angle += 90;
  return {
    mid: mid,
    radius: radius,
    direction: direction
  };
};

calculateGrowth = function(path, distance) {
  var direction, mid, newBeginning, newEnd, newMid, radius, ref, step, vector;
  ref = path.data.getCap(), mid = ref.mid, radius = ref.radius, direction = ref.direction;
  vector = direction.normalize(distance);
  newMid = mid.add(vector);
  step = vector.normalize(radius);
  step.angle += 90;
  newBeginning = newMid.add(step);
  newEnd = newMid.subtract(step);
  return {
    newBeginning: newBeginning,
    newEnd: newEnd
  };
};

grow = function(distance) {
  var newBeginning, newEnd, ref;
  ref = calculateGrowth(this, distance), newBeginning = ref.newBeginning, newEnd = ref.newEnd;
  this.insert(0, newBeginning);
  this.add(newEnd);
  return view.update();
};

turn = function(direction) {
  var mid, newBeginning, newEnd, radius, ref, ref1;
  if (direction !== 'left' && direction !== 'right') {
    throw new Error('invalid direction: must be left or right');
  }
  ref = this.data.getCap(), mid = ref.mid, radius = ref.radius, direction = ref.direction;
  ref1 = calculateGrowth(this, radius * 2), newBeginning = ref1.newBeginning, newEnd = ref1.newEnd;
  if (newBeginning.x < newEnd.x) {
    this.insert(0, newBeginning);
    return this.insert(0, newBeginning.add([radius * 2, 0]));
  } else {
    this.add(newEnd);
    return this.add(newEnd.add([radius, 0]));
  }
};

window.onload = function() {
  var path, tool;
  paper.install(window);
  paper.setup('container');
  project.currentStyle.strokeColor = 'black';
  tool = new Tool();
  path = new Path.Line(view.center.subtract([20, 0]), view.center.add([20, 0]));
  path.data.getCap = getCap.bind(path);
  path.data.grow = grow.bind(path);
  path.data.turn = turn.bind(path);
  return tool.onMouseDown = function() {
    path.data.grow(10);
    return path.data.turn('left');
  };
};
