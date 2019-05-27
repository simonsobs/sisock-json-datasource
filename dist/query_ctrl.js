'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GenericDatasourceQueryCtrl = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sdk = require('app/plugins/sdk');

require('./css/query-editor.css!');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GenericDatasourceQueryCtrl = exports.GenericDatasourceQueryCtrl = function (_QueryCtrl) {
  _inherits(GenericDatasourceQueryCtrl, _QueryCtrl);

  function GenericDatasourceQueryCtrl($scope, $injector) {
    _classCallCheck(this, GenericDatasourceQueryCtrl);

    var _this = _possibleConstructorReturn(this, (GenericDatasourceQueryCtrl.__proto__ || Object.getPrototypeOf(GenericDatasourceQueryCtrl)).call(this, $scope, $injector));

    _this.scope = $scope;

    // The casc_max should match the number of dropdowns defined in
    // query.editor.html.  There is not much internal checking on this
    // limit, though.
    _this.casc_max = 10;

    _this.casc_level = 0;
    for (var i = 0; i < _this.casc_max; i++) {
      _this['casc_data' + i] = '';
    }_this.target.target = _this.target.target || 'select metric';
    _this.target.type = _this.target.type || 'timeserie';
    if (_this.target.target != 'select_metric') _this.onChangeInternal(-1);
    return _this;
  }

  _createClass(GenericDatasourceQueryCtrl, [{
    key: 'getCasc',
    value: function getCasc(max_lev) {
      // Returns the current casc_dataX as an array.
      if (max_lev < 0 || max_lev > this.casc_level) max_lev = this.casc_level;
      var casc = [];
      for (var i = 0; i < max_lev; i++) {
        casc.push(this['casc_data' + i]);
      }return casc;
    }
  }, {
    key: 'setCasc',
    value: function setCasc(casc) {
      // Loads the values from casc into this.casc_data0+ and updates casc_level.
      this.casc_level = casc.length;
      for (var i = 0; i < casc.length; i++) {
        this['casc_data' + i] = casc[i];
      }
    }
  }, {
    key: 'getOptions',
    value: function getOptions(query) {
      this.opts_promise = this.datasource.metricFindQuery(query || '');
      return this.opts_promise;
    }
  }, {
    key: 'getCascOptions',
    value: function getCascOptions(level) {
      var _this2 = this;

      return this.opts_promise.then(function (opts) {
        var prefix = '';
        if (level > 0) {
          var casc = _this2.getCasc(level);
          prefix = casc.join('.');
        }
        opts = _.map(opts, function (v) {
          if (!v.value.startsWith(prefix)) return null;
          if (v.value == prefix) return '<end>';
          return v.value.split('.')[level];
        });
        opts = _.filter(opts, function (v, i, o) {
          return v && o.indexOf(v) === i;
        });
        return _.map(opts, function (v) {
          return { text: v, value: v };
        });
      });
    }
  }, {
    key: 'toggleEditorMode',
    value: function toggleEditorMode() {
      this.target.rawQuery = !this.target.rawQuery;
    }
  }, {
    key: 'onChangeInternal',
    value: function onChangeInternal(level) {
      var _this3 = this;

      // Keep this.target.target and this.casc_data0- in sync.
      //
      // Call with level = -1 if target is changed.
      // Call with level = N if boxN is changed.
      if (level < 0) {
        // Decompose target into the components.
        var comps = this.target.target.split('.');
        comps.push('<end>');
        this.setCasc(comps);
        this.panelCtrl.refresh(); // Asks the panel to refresh data.
      } else {
        this.getCascOptions(level).then(function (opts) {
          var casc = _this3.getCasc(level + 1);
          _this3.panelCtrl.refresh(); // Asks the panel to refresh data.
          opts = _.map(opts, function (opt) {
            return opt.value;
          });
          // Check if we match one of the options?
          if (!opts.includes(casc[level])) {
            // Set to the first option in the list.
            casc[level] = opts[0];
            _this3.setCasc(casc);
          }
          if (casc[level] != '<end>') return _this3.onChangeInternal(level + 1);

          _this3.target.target = casc.slice(0, level).join('.');
          _this3.setCasc(casc);
          _this3.panelCtrl.refresh(); // Asks the panel to refresh data.
        });
      }
    }
  }]);

  return GenericDatasourceQueryCtrl;
}(_sdk.QueryCtrl);

GenericDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';
//# sourceMappingURL=query_ctrl.js.map
