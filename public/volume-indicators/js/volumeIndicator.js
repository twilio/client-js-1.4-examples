/**
 * Create a volume indicator element to attach to the DOM.
 * @param {VolumeIndicatorOptions} [options]
 * @property {HTMLDivElement} element - The HTML element to add to the page.
 *//**
 * @typedef {Object} VolumeIndicatorOptions
 * @property {VolumeIndicator#determineColor} [determineColor] - An override for the default
 *   determineColor method.
 * @property {string} [height='100%'] - The CSS height to apply to the wrapper object, limiting the size
 *   of the indicator. Defaults to 100% to fill its parent.
 * @property {boolean} [vertical=false] - Whether the bar should be vertical (rather than horizontal).
 * @property {string} [width='100%'] - The CSS width to apply to the wrapper object, limiting the size
 *   of the indicator. Defaults to 100% to fill its parent.
 */
function VolumeIndicator(options) {
  if (!(this instanceof VolumeIndicator)) {
    return new VolumeIndicator(options);
  }

  options = Object.assign({
    // Allow a custom document for testing headlessly.
    _document: typeof document !== 'undefined' && document,
    determineColor : defaultDetermineColor,
    height: '100%',
    vertical: false,
    width: '100%'
  }, options);

  // Create the wrapper div that sets the boundaries for the volume bar. The volume bar
  // will expand and contract to fill the wrapper.
  const wrapperEl = options._document.createElement('div');
  wrapperEl.style.width = options.width;
  wrapperEl.style.height = options.height;
  wrapperEl.style.display = 'block';
  wrapperEl.style.position = 'relative';

  // Create the volume bar itself.
  const barEl = options._document.createElement('div');
  barEl.style.display = 'block';
  barEl.style.position = 'absolute';
  wrapperEl.appendChild(barEl);

  // Set the static side (width or height) of the volume bar to 100%, based on whether we are
  // scaling vertically or horizontally.
  const staticDimension = options.vertical ? 'width' : 'height';
  barEl.style[staticDimension] = '100%';

  // Anchor the volume bar to grow from the appropriate side.
  const anchorSide = options.vertical ? 'bottom' : 'left';
  barEl.style[anchorSide] = 0;

  // Set all properties as read-only.
  Object.defineProperties(this, {
    _barElement: { value: barEl },
    _determineColor: { value: options.determineColor },
    _scaleDimension: { value: options.vertical ? 'height' : 'width' },
    element: {
      enumerable: true,
      value: wrapperEl
    }
  });
}

/**
 * Update the indicator with a new volume.
 * @param {number} - A double (0.00 to 1.00 inclusive) representing the current volume.
 * @return {void}
 */
VolumeIndicator.prototype.setVolume = function setVolume(volume) {
  // Scale the bar to a percentage of the total available space vertically or horizontally.
  this._barElement.style[this._scaleDimension] = `${Math.round(volume * 100)}%`;

  // Set the color of the bar based on the determineColor method defined at construction.
  this._barElement.style.backgroundColor = this._determineColor(volume);
};

/**
 * @typedef {function} VolumeIndicator#determineColor
 * @param {number} - A double (0.00 to 1.00 inclusive) representing the current volume.
 * @returns {string} A color string to apply to the bar.
 */
function defaultDetermineColor(volume) {
  if (volume > 0.75) { return 'red'; }
  if (volume > 0.50) { return 'yellow'; }
  return 'green';
}

window.VolumeIndicator = VolumeIndicator;
