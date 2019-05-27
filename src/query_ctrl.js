import {QueryCtrl} from 'app/plugins/sdk';
import './css/query-editor.css!'

export class GenericDatasourceQueryCtrl extends QueryCtrl {

  constructor($scope, $injector)  {
    super($scope, $injector);

    this.scope = $scope;

    // The casc_max should match the number of dropdowns defined in
    // query.editor.html.  There is not much internal checking on this
    // limit, though.
    this.casc_max = 10;

    this.casc_level = 0;
    for (var i=0; i <this.casc_max; i++)
      this['casc_data' + i] = '';

    this.target.target = this.target.target || 'select metric';
    this.target.type = this.target.type || 'timeserie';
    if (this.target.target != 'select_metric')
      this.onChangeInternal(-1);
  }

  getCasc(max_lev) {
    // Returns the current casc_dataX as an array.
    if (max_lev < 0 || max_lev > this.casc_level)
      max_lev = this.casc_level;
    var casc = [];
    for (var i=0; i <max_lev; i++)
      casc.push(this['casc_data' + i]);
    return casc;
  }

  setCasc(casc) {
    // Loads the values from casc into this.casc_data0+ and updates casc_level.
    this.casc_level = casc.length;
    for (var i=0; i <casc.length; i++)
      this['casc_data' + i] = casc[i];
  }

  getOptions(query) {
    this.opts_promise = this.datasource.metricFindQuery(query || '');
    return this.opts_promise;
  }

  getCascOptions(level) {
    return this.opts_promise.then(opts => {
      var prefix = '';
      if (level > 0) {
        var casc = this.getCasc(level);
        prefix = casc.join('.');
      }
      opts = _.map(opts, v => {
        if (!v.value.startsWith(prefix))
          return null;
        if (v.value == prefix)
          return '<end>';
        return v.value.split('.')[level];
      });
      opts = _.filter(opts, (v,i,o) => v && o.indexOf(v) === i);
      return _.map(opts, v => {
        return {text: v, value: v};
      });
    });
  }

  toggleEditorMode() {
    this.target.rawQuery = !this.target.rawQuery;
  }

  onChangeInternal(level) {
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
      this.getCascOptions(level).then(opts => {
        var casc = this.getCasc(level+1);
        this.panelCtrl.refresh(); // Asks the panel to refresh data.
        opts = _.map(opts, opt => opt.value);
        // Check if we match one of the options?
        if (!opts.includes(casc[level])) {
          // Set to the first option in the list.
          casc[level] = opts[0];
          this.setCasc(casc);
        }
        if (casc[level] != '<end>')
          return this.onChangeInternal(level+1);

        this.target.target = casc.slice(0,level).join('.');
        this.setCasc(casc);
        this.panelCtrl.refresh(); // Asks the panel to refresh data.
      });
    }
  }
}

GenericDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';

