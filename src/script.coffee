regularDistribution = (options) ->
  { samples, min, max, inclusive } = options
  inclusive = true if not inclusive?
  width = max - min

  addValue = (i) ->
    min + (width * (i / samples))
  range = if inclusive then [0..samples] else [1...samples]
  range.map addValue

random = (min, max) ->
  dist = max - min
  min + (Math.random() * dist)

clamp = (n, min, max) ->
  n = Math.max(n, min) if min?
  n = Math.min(n, max) if max?
  n

DrunkenWalk = (options) ->
  { startingValue, noiseAmplitude, clamp: { min, max } } = options
  noiseMax = noiseAmplitude / 2
  noiseMin = -noiseMax
  @previousValue = startingValue
  next: () => 
    currentValue = @previousValue + random noiseMin, noiseMax
    currentValue = clamp currentValue, min, max
    @previousValue = currentValue
    currentValue

line = (p1, p2) ->
  slope = (p2.y - p1.y) / (p2.x - p1.x)
  (x) -> slope * (x - p1.x) + p1.y

mix = (a, b, proportion) ->
  inverseProportion = 1 - proportion
  (a * proportion) + (b * inverseProportion)

mixRGB = (color1, color2, proportion) ->
  newColor = color1.clone()
  newColor.red = mix color1.red, color2.red, proportion
  newColor.blue = mix color1.blue, color2.blue, proportion
  newColor.green = mix color1.green, color2.green, proportion
  newColor

getCap = () ->
  beginning = @firstSegment.point
  end = @lastSegment.point
  # cap is the vector that defines how
  # you would move from the beginning of the path
  # to the end of the path. In other words, how
  # you would cap the shape of the current path.
  # Note that it represents the *relative* movement
  # from the beginning to the end, and therefore
  # starts at the origin, not at the beginning of the path.
  cap = end.subtract beginning
  radius = cap.length / 2

  # mid is the middle of the line segment
  # that connects the beginning and the end of the path.
  # Since cap is a relative vector (i.e., starts at the origin)
  # we have to translate it to the beginning of the path
  # before dividing it to get the midpoint between 
  # the path's beginnning and end.
  mid = beginning.add cap.divide 2
  direction = cap.normalize()
  direction.angle += 90
  mid: mid, radius: radius, direction: direction

calculateGrowth = (path, distance) ->
  {mid, radius, direction} = path.data.getCap()
  vector = direction.normalize(distance)
  newMid = mid.add vector
  step = vector.normalize radius
  step.angle += 90

  newBeginning = newMid.add step
  newEnd = newMid.subtract step
  newBeginning: newBeginning, newEnd: newEnd
  
grow = (distance) ->
  {newBeginning, newEnd} = calculateGrowth(@, distance)
  @insert 0, newBeginning
  @add newEnd
  view.update()

turn = (direction) ->
  throw new Error('invalid direction: must be left or right') if direction not in ['left', 'right']
  {mid, radius, direction} = @data.getCap()
  {newBeginning, newEnd} = calculateGrowth(@, radius * 2)
  if newBeginning.x < newEnd.x
    @insert 0, newBeginning
    @insert 0, newBeginning.add([radius * 2, 0])
  else
    @add newEnd
    @add newEnd.add([radius, 0])

# Only run our code once the DOM is ready.
window.onload = ->
  # Set up paper.js
  paper.install window
  paper.setup 'container'

  project.currentStyle.strokeColor = 'black'
  tool = new Tool()

  path = new Path.Line(view.center.subtract([20, 0]), view.center.add([20, 0]))
  path.data.getCap = getCap.bind path
  path.data.grow = grow.bind path
  path.data.turn = turn.bind path
  tool.onMouseDown = () -> path.data.grow(10); path.data.turn 'left'
    
  #view.onFrame = () ->
    #view.update()
