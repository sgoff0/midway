"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    ui: 'React.createClass({\n\
    displayName: "Select",\n\
\n\
    render: function() {\n\
      var defaultValue;\n\
      var options = _.map(this.props.options, function(data, index) {\n\
        var label = value;\n\
        var value = data;\n\
        if (typeof data !== "string") {\n\
          label = data.label;\n\
          value = data.value;\n\
        }\n\
        if (this.props.value === value) {\n\
          defaultValue = index + "";\n\
        }\n\
        return React.DOM.option({ key: label, value: index + "" }, label);\n\
      }, this);\n\
\n\
      return React.createElement(InputItemWrapper, { id: \'input-\' + this.props.id, label: this.props.label },\n\
        React.DOM.select({ id: this.props.id, className: "ui dropdown", name: this.props.id, defaultValue: defaultValue,\n\
          onChange: this.onChange }, options)\n\
      );\n\
    },\n\
\n\
    onChange: function(ev) {\n\
      var el = ev.currentTarget;\n\
      var index = el.options[el.selectedIndex].value;\n\
      this.props.onChange(this.props.options[parseInt(index, 10)].value);\n\
    }\n\
  });'
};
//# sourceMappingURL=select.js.map