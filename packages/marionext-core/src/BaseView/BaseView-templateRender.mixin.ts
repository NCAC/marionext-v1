import { _ } from "marionext-lodash";
import { VDom } from "marionext-vdom";

// const patch = init([
//   attributesModule,
//   eventListenersModule,
//   classModule,
//   propsModule,
//   styleModule,
//   datasetModule
// ]);

// MixinOptions
// - template
// - templateContext

interface TemplateRenderMixin {
  outRender: boolean;
  template?: any;
  elTree: boolean | VDom.VNode;
  _renderTemplate(template: any): void; // TODO: precise type of template arg
  getTemplate(): any; // TODO: precise type of return
  mixinTemplateContext(serializeData: any): any;
  serializeModel(): ObjectHash;
  serializeData(): any;
  serializeCollection(): any;
  _renderHtml(template: any, data: any): any;
  attachElContent(html: string): void;
}

const TemplateRenderMixin: TemplateRenderMixin = {
  template: false,

  // Internal method to render the template with the serialized data
  // and template context
  _renderTemplate(this: GenericView, template) {
    // Add in entity data and template context
    const data = this.mixinTemplateContext(this.serializeData()) || {};

    // Render and add to el
    const html = this._renderHtml(template, data);
    if (typeof html !== "undefined") {
      this.attachElContent(html);
    }
  },

  // Get the template for this view instance.
  // You can set a `template` attribute in the view definition
  // or pass a `template: TemplateFunction` parameter in
  // to the constructor options.
  getTemplate(this: GenericView) {
    return this.template;
  },

  // Mix in template context methods. Looks for a
  // `templateContext` attribute, which can either be an
  // object literal, or a function that returns an object
  // literal. All methods and attributes from this object
  // are copies to the object passed in.
  mixinTemplateContext(this: GenericView, serializedData) {
    const templateContext = _.result(this, "templateContext");
    if (!templateContext) {
      return serializedData;
    }
    if (!serializedData) {
      return templateContext;
    }
    return Object.assign({}, serializedData, templateContext);
  },

  // Serialize the view's model *or* collection, if
  // it exists, for the template
  serializeData(this: GenericView) {
    // If we have a model, we serialize that
    if (this.model) {
      return this.serializeModel();
    }

    // Otherwise, we serialize the collection,
    // making it available under the `items` property
    if (this.collection) {
      return {
        items: this.serializeCollection()
      };
    }
  },

  // Prepares the special `model` property of a view
  // for being displayed in the template. Override this if
  // you need a custom transformation for your view's model
  serializeModel(this: GenericView) {
    return this.model.attributes;
  },

  // Serialize a collection
  serializeCollection(this: GenericView) {
    return this.collection.models.map(function (model) {
      return model.attributes;
    });
  },

  outRender: true,

  elTree: false,

  // Renders the data into the template
  _renderHtml(this: GenericView, template, data) {
    // there, snabbdom
    // return template(data);
    const newTree = template.call(this, data, VDom.h)[0] as VDom.VNode;
    let rootTag;
    if (this.outRender) {
      rootTag = newTree.sel;
    } else {
      rootTag = this.tagName;
    }
    if (!this.elTree) {
      // First render, this.elTree is not initialized
      const emptyTree = VDom.vnode(rootTag, {}, [], undefined, this.el);
      VDom.patch(emptyTree, newTree);
      // empty vtree on destroy to ensure hooks gets called
      this.on("destroy", () => {
        VDom.patch(
          this.elTree as VDom.VNode,
          VDom.vnode(rootTag, {}, [], undefined, this.el)
        );
      });
    } else {
      VDom.patch(this.elTree as VDom.VNode, newTree);
    }
    this.elTree = newTree;
  },

  // Attaches the content of a given view.
  // This method can be overridden to optimize rendering,
  // or to render in a non standard way.
  //
  // For example, using `innerHTML` instead of `$el.html`
  //
  // ```js
  // attachElContent(html) {
  //   this.el.innerHTML = html;
  // }
  // ```
  attachElContent(this: GenericView, html) {
    this.Dom.setContents(this.el, html, this.$el);
  }
};

export { TemplateRenderMixin };
