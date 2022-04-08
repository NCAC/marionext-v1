import { $dom } from "marionext-dom";
interface ViewRenderMixin {
  // If a template is available, renders it into the view's `el`
  // Re-inits regions and binds UI.
  render(): BaseView;
}

const ViewRenderMixin: ViewRenderMixin = {
  render(this: BaseView) {
    var template = this.getTemplate();

    if (template === false || this._isDestroyed) {
      return this;
    }

    this.triggerMethod("before:render", this);

    // If this is not the first render call, then we need to
    // re-initialize the `el` for each region
    if (this._isRendered && !this.elTree) {
      this._reInitRegions();
    }

    this._renderTemplate(template);
    //
    if (this.elTree) {
      // need to ensure el and $el are correctly set, because vdom has been replaced it in the real DOM
      this.setElement(this.getOption("el"));
      // this.$el = $dom(this.el);
    }
    this.bindUIElements();

    this._isRendered = true;
    this.triggerMethod("render", this);

    return this;
  }
};

export { ViewRenderMixin };
