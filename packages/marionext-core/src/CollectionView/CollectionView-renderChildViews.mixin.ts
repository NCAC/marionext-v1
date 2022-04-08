import { View } from "../View";
import { Model, Collection } from "marionext-data";
import { CollectionView } from "../CollectionView";
import { renderView } from "../BaseView/BaseView-renderDestroy.functions";
import { $Dom } from "marionext-dom";

interface CollectionViewRenderChildViewsMixin {
  _renderChildren(): void;

  // Renders each view and creates a fragment buffer from them
  _getBuffer(views: View<Model>[]): Element | DocumentFragment;
  _attachChildren(els: DocumentFragment | Element, views: View<Model>[]): void; // TODO els ???

  // Override this method to do something other than `.append`.
  // You can attach any HTML at this point including the els.
  attachHtml(els: Element | DocumentFragment, $container: $Dom): void;
}

const CollectionViewRenderChildViewsMixin: CollectionViewRenderChildViewsMixin =
  {
    _renderChildren(
      this: CollectionView<Model, View<Model>, Collection<Model>>
    ) {
      const views = this._addedViews || this.children._views;

      this.triggerMethod("before:render:children", this, views);

      if (this.isEmpty()) {
        this._showEmptyView();
      } else {
        this._destroyEmptyView();

        const els = this._getBuffer(views);

        this._attachChildren(els, views);
      }

      delete this._addedViews;

      this.triggerMethod("render:children", this, views);
    },
    _getBuffer(
      this: CollectionView<Model, View<Model>, Collection<Model>>,
      views
    ) {
      const elBuffer = this.Dom.createBuffer();

      views.forEach((view) => {
        renderView(view);
        this.Dom.appendContents(elBuffer, view.el, { _$contents: view.$el });
      });

      return elBuffer;
    },

    _attachChildren(
      this: CollectionView<Model, View<Model>, Collection<Model>>,
      els,
      views
    ) {
      const shouldTriggerAttach =
        this._isAttached && this.monitorViewEvents !== false;

      views = shouldTriggerAttach ? views : [];

      views.forEach((view) => {
        if (view._isAttached) {
          return;
        }
        view.triggerMethod("before:attach", view);
      });

      this.attachHtml(els, this.$container);

      views.forEach((view) => {
        if (view._isAttached) {
          return;
        }
        view._isAttached = true;
        view.triggerMethod("attach", view);
      });
    },
    attachHtml(
      this: CollectionView<Model, View<Model>, Collection<Model>>,
      els,
      $container
    ) {
      this.Dom.appendContents($container[0], els, { _$el: $container });
    }
  };

export { CollectionViewRenderChildViewsMixin };
