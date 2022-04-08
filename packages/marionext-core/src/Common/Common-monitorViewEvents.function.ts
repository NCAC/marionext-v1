// DOM Refresh
// -----------
import { View } from "../View";
import { Model, Collection } from "marionext-data";
import { CollectionView } from "../CollectionView";

// Trigger method on children unless a pure Backbone.View
function triggerMethodChildren(
  view: CollectionView<Model, View<Model>, Collection<Model>>,
  event,
  shouldTrigger
) {
  if (!view._getImmediateChildren) {
    return;
  }
  view._getImmediateChildren().forEach(child => {
    if (!shouldTrigger(child)) {
      return;
    }
    child.triggerMethod(event, child);
  });
}

function shouldTriggerAttach(view: GenericView) {
  return !view._isAttached;
}

function shouldAttach(view: GenericView) {
  if (!shouldTriggerAttach(view)) {
    return false;
  }
  view._isAttached = true;
  return true;
}

function shouldTriggerDetach(view: GenericView) {
  return view._isAttached;
}

function shouldDetach(view: GenericView) {
  if (!shouldTriggerDetach(view)) {
    return false;
  }
  view._isAttached = false;
  return true;
}

function triggerDOMRefresh(view: GenericView) {
  if (view._isAttached && view._isRendered) {
    view.triggerMethod("dom:refresh", view);
  }
}

function triggerDOMRemove(view: GenericView) {
  if (view._isAttached && view._isRendered) {
    view.triggerMethod("dom:remove", view);
  }
}

function handleBeforeAttach() {
  triggerMethodChildren(this, "before:attach", shouldTriggerAttach);
}

function handleAttach() {
  triggerMethodChildren(this, "attach", shouldAttach);
  triggerDOMRefresh(this);
}

function handleBeforeDetach() {
  triggerMethodChildren(this, "before:detach", shouldTriggerDetach);
  triggerDOMRemove(this);
}

function handleDetach() {
  triggerMethodChildren(this, "detach", shouldDetach);
}

function handleBeforeRender() {
  triggerDOMRemove(this);
}

function handleRender() {
  triggerDOMRefresh(this);
}

// Monitor a view's state, propagating attach/detach events to children and firing dom:refresh
// whenever a rendered view is attached or an attached view is rendered.
type monitorViewEvents = (view: GenericView) => void;
const monitorViewEvents: monitorViewEvents = function(view) {
  if (view._areViewEventsMonitored || view.monitorViewEvents === false) {
    return;
  }

  view._areViewEventsMonitored = true;

  view.on({
    "before:attach": handleBeforeAttach,
    attach: handleAttach,
    "before:detach": handleBeforeDetach,
    detach: handleDetach,
    "before:render": handleBeforeRender,
    render: handleRender
  });
};

export { monitorViewEvents };
