"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    ui: 'React.createClass({\n\
      displayName: "Checkbox",\n\
  \n\
    render: function() {\n\
      return React.createElement(InputItemWrapper, {\n\
        id: this.props.id, label: this.props.label },\n\
        React.DOM.div({className: "ui toggle checkbox"},\n\
          React.DOM.input({ id: \'input-\' + this.props.id, type: "checkbox", className: "hidden", name: this.props.id, defaultChecked: this.props.value,\n\
            onChange: this.onChange }),\n\
          React.DOM.label({htmlFor: \'input-\' + this.props.id}, this.props.value ? "yes" : "no")\n\
        )\n\
      );\n\
    },\n\
  \n\
    onChange: function(ev) {\n\
      this.props.onChange(ev.currentTarget.checked);\n\
    }\n\
  });'
};
//# sourceMappingURL=checkbox.js.map