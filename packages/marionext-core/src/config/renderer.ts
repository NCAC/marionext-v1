// Static setter for the renderer

type tSetRenderer = (renderer: any) => any;
const setRenderer: tSetRenderer = function setRenderer(renderer) {
  this.prototype._renderHtml = renderer;
  return this;
}

export {
  tSetRenderer,
  setRenderer
};
