import { Component } from '@angular/core';

@Component({
  selector: 'demo-form-doc-json',
  templateUrl: './form-bootstrap-doc-json.component.html'
})
export class DemoFormBootstrapDocJsonComponent {
  jsonContent = require('./form.json');

  demoComponentContent = require('!!raw-loader!./form-bootstrap-json.component.ts').default;
  demoHtmlContent = require('!!raw-loader!./form-bootstrap-json.component.html').default;
  demoCssContent = require('!!raw-loader!./form-bootstrap-json.component.scss').default;
}
