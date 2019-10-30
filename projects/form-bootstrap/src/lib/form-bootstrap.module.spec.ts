import { Component, Input, NgModule, NO_ERRORS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FlexyLayoutModule } from '@ng-flexy/layout';
import { FlexyFormsModule } from '@ng-flexy/form';
import { FlexyFormJsonMapperService } from '@ng-flexy/form';
import { FlexyFormFieldLayoutSchema, FlexyFormLayoutSchema } from '@ng-flexy/form';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexyLoggerService } from '@ng-flexy/core';
import { FlexyToastsService } from '@ng-flexy/toasts';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap';
import { cloneDeep, set } from 'lodash';
import { FlexyForm } from '@ng-flexy/form';
import { FLEXY_FORM_CONTROLS_JSON_MAPPER, FlexyBootstrapFormsModule } from './form-bootstrap.module';
import { FLEXY_LAYOUT_COMPONENT_MAP } from '@ng-flexy/layout';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const FORM_DATA = require('../testing/form/form.data.json');
const FORM_SCHEMA = require('../testing/form/form.schema.json');

describe('Flexy Forms', () => {
  let fixture: ComponentFixture<FormTestingComponent>;
  let component: FormTestingComponent;
  let page: Page;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        TestingCustomModule,
        TooltipModule.forRoot(),
        FlexyLayoutModule.forRoot(),
        FlexyFormsModule.forRoot(),
        FlexyBootstrapFormsModule.forRoot(),
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })
      ],
      providers: [
        FlexyLoggerService,
        FlexyToastsService,
        {
          provide: FLEXY_LAYOUT_COMPONENT_MAP,
          multi: true,
          useValue: { 'custom-cmp': TestingCustomComponent, ...FLEXY_FORM_CONTROLS_JSON_MAPPER }
        }
      ],
      declarations: [FormTestingComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(FormTestingComponent);

        component = fixture.componentInstance;
        fixture.detectChanges();

        page = new Page(fixture);
      });
  }));

  it('should create simple form from json schema - fieldset of fields', async(() => {
    fixture.whenRenderingDone().then(() => {
      fixture.detectChanges();

      expect(component).toBeTruthy();
      expect(component.schema.length).toBe(4);

      // check group 1
      expect(component.schema[0].children.length).toBe(2);

      expect((component.schema[0] as FlexyFormFieldLayoutSchema).formName).toBeUndefined();
      expect((component.schema[0] as FlexyFormFieldLayoutSchema).id).toBe('0');
      expect((component.schema[0] as FlexyFormFieldLayoutSchema).formControl instanceof FormGroup).toBeTruthy();
      expect((<FormGroup>(component.schema[0] as FlexyFormFieldLayoutSchema).formControl).contains('p1')).toBeTruthy();
      expect((<FormGroup>(component.schema[0] as FlexyFormFieldLayoutSchema).formControl).contains('p2')).toBeTruthy();

      expect((component.schema[0].children[0] as FlexyFormFieldLayoutSchema).formName).toBe('p1');
      expect((component.schema[0].children[0] as FlexyFormFieldLayoutSchema).id).toBe('0/0');
      expect((component.schema[0].children[0] as FlexyFormFieldLayoutSchema).formControl instanceof FormControl).toBeTruthy();
      expect((component.schema[0].children[0] as FlexyFormFieldLayoutSchema).formControl.value).toBe(FORM_DATA.p1);

      expect((component.schema[0].children[1] as FlexyFormFieldLayoutSchema).formName).toBe('p2');
      expect((component.schema[0].children[1] as FlexyFormFieldLayoutSchema).id).toBe('0/1');
      expect((component.schema[0].children[1] as FlexyFormFieldLayoutSchema).formControl instanceof FormControl).toBeTruthy();
      expect((component.schema[0].children[1] as FlexyFormFieldLayoutSchema).formControl.value).toBe(FORM_DATA.p2);
    });
  }));

  it('should create form from json schema - fieldset of fieldset or fields', async(() => {
    fixture.whenRenderingDone().then(() => {
      fixture.detectChanges();

      expect(component).toBeTruthy();
      expect(component.schema.length).toBe(4);

      // check group 2
      const group2 = component.schema[1] as FlexyFormFieldLayoutSchema;
      expect(group2.formName).toBeUndefined();
      expect(group2.id).toBe('1');
      expect(group2.formControl instanceof FormGroup).toBeTruthy();
      expect(group2.children.length).toBe(2);

      expect(group2.children[0].children.length).toBe(1);
      const component2_1 = group2.children[0].children[0] as FlexyFormFieldLayoutSchema;
      expect(component2_1.type).toBe('component');
      expect(component2_1.formName).toBe('p3.x1');
      expect(component2_1.id).toBe('1/0/0');
      expect(component2_1.formControl instanceof FormControl).toBeTruthy();
      expect(component2_1.formControl.value).toBe(FORM_DATA.p3.x1);

      const component2_2 = group2.children[1].children[0] as FlexyFormFieldLayoutSchema;
      expect(component2_2.type).toBe('component');
      expect(component2_2.formName).toBe('p3.x2');
      expect(component2_2.id).toBe('1/1/0');
      expect(component2_2.formControl instanceof FormControl).toBeTruthy();
      expect(component2_2.formControl.value).toBe(FORM_DATA.p3.x2);
    });
  }));

  it('should create form from json schema - array of fields', async(() => {
    fixture.whenRenderingDone().then(() => {
      fixture.detectChanges();

      expect(component).toBeTruthy();
      expect(component.schema.length).toBe(4);

      // check group 3 simple array
      const group3 = component.schema[2] as FlexyFormFieldLayoutSchema;
      expect(group3.formName).toBeUndefined();
      expect(group3.id).toBe('2');
      expect(group3.formControl instanceof FormGroup).toBeTruthy();
      expect(group3.children.length).toBe(1);

      const array3 = group3.children[0] as FlexyFormFieldLayoutSchema;
      expect(array3.id).toBe('2/0');
      expect(array3.formName).toBe('paramMulti');
      expect(array3.formControl instanceof FormArray).toBeTruthy();

      expect(array3.formControl.value).toEqual(FORM_DATA.paramMulti);

      expect(array3.items.length).toBe(4);

      for (let i = 0; i < 4; i++) {
        const item = array3.items[i] as FlexyFormFieldLayoutSchema;
        expect(item.type).toBe('component');
        expect(item.id).toBe('2/0:' + i);
        expect(item.formName).toBe('' + i);
        expect(item.formControl instanceof FormControl).toBeTruthy();
        expect(item.formControl.value).toBe(FORM_DATA.paramMulti[i]);
      }
    });
  }));

  it('should create form from json schema - array of fieldset or fields', async(() => {
    fixture.whenRenderingDone().then(() => {
      fixture.detectChanges();

      expect(component).toBeTruthy();
      expect(component.schema.length).toBe(4);

      // check group 4 complex array with external props auto indexing "%"
      const group4 = component.schema[3] as FlexyFormFieldLayoutSchema;
      expect(group4.formName).toBeUndefined();
      expect(group4.id).toBe('3');
      expect(group4.formControl instanceof FormGroup).toBeTruthy();
      expect(group4.children.length).toBe(1);

      const array4 = group4.children[0] as FlexyFormFieldLayoutSchema;
      expect(array4.id).toBe('3/0');
      expect(array4.formName).toBe('paramMultiComplex');
      expect(array4.formControl instanceof FormArray).toBeTruthy();
      expect(array4.items.length).toBe(2);
      for (let i = 0; i < 2; i++) {
        const item = array4.items[i] as FlexyFormFieldLayoutSchema;
        expect(item.id).toBe('3/0/' + i);
        expect(item.formName).toBe('' + i);
        expect(item.type).toBeUndefined();
        expect(item.children.length).toBe(1);

        const itemFieldset = item.children[0] as FlexyFormFieldLayoutSchema;
        expect(itemFieldset.id).toBe('3/0/' + i + '/0');
        expect(itemFieldset.formName).toBeUndefined();
        expect(itemFieldset.type).toBe('component');
        expect(itemFieldset.formControl instanceof FormGroup).toBeTruthy();

        const arrayParam1 = itemFieldset.children[0] as FlexyFormFieldLayoutSchema;
        expect(arrayParam1.type).toBe('component');
        expect(arrayParam1.id).toBe('3/0/' + i + '/0/0');
        expect(arrayParam1.formName).toBe('arrayParam1');
        expect(arrayParam1.formControl instanceof FormControl).toBeTruthy();
        expect(arrayParam1.formControl.value).toBe(FORM_DATA.paramMultiComplex[i].arrayParam1);

        const arraySubFieldset = itemFieldset.children[4] as FlexyFormFieldLayoutSchema;
        expect(arraySubFieldset.type).toBe('component');
        expect(arraySubFieldset.id).toBe('3/0/' + i + '/0/4');
        expect(arraySubFieldset.formControl instanceof FormGroup).toBeTruthy();

        expect(arraySubFieldset.children.length).toBe(2);

        const subItemP1 = arraySubFieldset.children[0] as FlexyFormFieldLayoutSchema;
        expect(subItemP1.type).toBe('component');
        expect(subItemP1.id).toBe('3/0/' + i + '/0/4/0');
        expect(subItemP1.formName).toBe('arrayFieldset.P1');
        expect(subItemP1.formControl instanceof FormControl).toBeTruthy();
        expect(subItemP1.formControl.value).toBe(FORM_DATA.paramMultiComplex[i].arrayFieldset.P1);

        const subItemP2 = arraySubFieldset.children[1] as FlexyFormFieldLayoutSchema;
        expect(subItemP2.type).toBe('component');
        expect(subItemP2.id).toBe('3/0/' + i + '/0/4/1');
        expect(subItemP2.formName).toBe('arrayFieldset.P2');
        expect(subItemP2.formControl instanceof FormControl).toBeTruthy();
        expect(subItemP2.formControl.value).toBe(FORM_DATA.paramMultiComplex[i].arrayFieldset.P2);
      }
    });
  }));

  it('should create form from json schema - array of fieldset with "::{pathFromRoot}%" parameters (% is index of array)', async(() => {
    fixture.whenRenderingDone().then(() => {
      fixture.detectChanges();

      expect(component).toBeTruthy();
      expect(component.schema.length).toBe(4);

      const group4 = component.schema[3] as FlexyFormFieldLayoutSchema;

      const array4 = group4.children[0] as FlexyFormFieldLayoutSchema;

      for (let i = 0; i < 2; i++) {
        const item = array4.items[i] as FlexyFormFieldLayoutSchema;
        const itemFieldset = item.children[0] as FlexyFormFieldLayoutSchema;
        const arrayExternalParam = itemFieldset.children[5] as FlexyFormFieldLayoutSchema;
        const extIndex = i + 1;
        expect(arrayExternalParam.type).toBe('component');
        expect(arrayExternalParam.id).toBe('3/0/' + i + '/0/5');
        expect(arrayExternalParam.formName).toBe('::ParamExt' + extIndex);
        expect(arrayExternalParam.formControl instanceof FormControl).toBeTruthy();
        expect(arrayExternalParam.formControl.value).toBe(FORM_DATA['ParamExt' + extIndex]);
      }
    });
  }));

  it('should get data from form', async(() => {
    fixture.whenRenderingDone().then(() => {
      fixture.detectChanges();

      expect(component).toBeTruthy();
      expect(component.getAllData()).toEqual(FORM_DATA);

      const data = cloneDeep(FORM_DATA);

      // easy field
      const p1FormControl = (component.schema[0].children[0] as FlexyFormFieldLayoutSchema).formControl as FormControl;
      p1FormControl.setValue('Ala');
      p1FormControl.markAsDirty();
      fixture.detectChanges();
      data.p1 = 'Ala';
      expect(component.getAllData()).toEqual(data);

      // fieldset field
      const p3x1FormControl = (component.schema[1].children[0].children[0] as FlexyFormFieldLayoutSchema).formControl as FormControl;
      p3x1FormControl.setValue('Ola');
      p3x1FormControl.markAsDirty();
      fixture.detectChanges();
      data.p3.x1 = 'Ola';
      expect(component.getAllData()).toEqual(data);

      // simple array
      const array3 = component.schema[2].children[0] as FlexyFormFieldLayoutSchema;
      const item2 = (array3.items[1] as FlexyFormFieldLayoutSchema).formControl as FormControl;
      item2.setValue('Jan');
      item2.markAsDirty();
      fixture.detectChanges();
      data.paramMulti[1] = 'Jan';
      expect(component.getAllData()).toEqual(data);

      // complex array
      const complexArrayIndex = 1;

      const group4 = component.schema[3] as FlexyFormFieldLayoutSchema;
      const array4 = group4.children[0] as FlexyFormFieldLayoutSchema;

      const array4item2 = array4.items[complexArrayIndex] as FlexyFormFieldLayoutSchema;
      const itemFieldset = array4item2.children[0] as FlexyFormFieldLayoutSchema;

      const arrayParam1 = itemFieldset.children[0] as FlexyFormFieldLayoutSchema;
      arrayParam1.formControl.setValue(5);
      arrayParam1.formControl.markAsDirty();
      fixture.detectChanges();
      data.paramMultiComplex[complexArrayIndex].arrayParam1 = 5;
      expect(component.getAllData()).toEqual(data);

      const arraySubFieldset = itemFieldset.children[4] as FlexyFormFieldLayoutSchema;
      const subItemP1 = arraySubFieldset.children[0] as FlexyFormFieldLayoutSchema;
      subItemP1.formControl.setValue('Kazimierz I');
      subItemP1.formControl.markAsDirty();
      fixture.detectChanges();
      data.paramMultiComplex[complexArrayIndex].arrayFieldset.P1 = 'Kazimierz I';
      expect(component.getAllData()).toEqual(data);

      const subItemP2 = arraySubFieldset.children[1] as FlexyFormFieldLayoutSchema;
      subItemP2.formControl.setValue('Kazimierz II');
      subItemP2.formControl.markAsDirty();
      fixture.detectChanges();
      data.paramMultiComplex[complexArrayIndex].arrayFieldset.P2 = 'Kazimierz II';
      expect(component.getAllData()).toEqual(data);

      // complex array with external
      const arrayExternalParam = itemFieldset.children[5] as FlexyFormFieldLayoutSchema;
      arrayExternalParam.formControl.setValue(55);
      arrayExternalParam.formControl.markAsDirty();
      fixture.detectChanges();
      data['ParamExt' + (complexArrayIndex + 1)] = 55;
      expect(component.getAllData()).toEqual(data);
    });
  }));

  it('should get dirty data from form', async(() => {
    fixture.whenRenderingDone().then(() => {
      fixture.detectChanges();

      const data: any = {};
      expect(component).toBeTruthy();
      expect(component.getDirtyData()).toEqual(data);

      const p1FormControl = (component.schema[0].children[0] as FlexyFormFieldLayoutSchema).formControl as FormControl;
      p1FormControl.setValue('Ala');
      p1FormControl.markAsDirty();
      fixture.detectChanges();
      data.p1 = 'Ala';
      expect(component.getDirtyData()).toEqual(data);

      // fieldset field
      const p3x1FormControl = (component.schema[1].children[0].children[0] as FlexyFormFieldLayoutSchema).formControl as FormControl;
      p3x1FormControl.setValue('Ola');
      p3x1FormControl.markAsDirty();
      fixture.detectChanges();
      set(data, 'p3.x1', 'Ola');
      expect(component.getDirtyData()).toEqual(data);

      // simple array
      const array3 = component.schema[2].children[0] as FlexyFormFieldLayoutSchema;
      const item2 = (array3.items[1] as FlexyFormFieldLayoutSchema).formControl as FormControl;
      item2.setValue('Jan');
      item2.markAsDirty();
      fixture.detectChanges();
      set(data, 'paramMulti', { ['1']: 'Jan' });
      expect(component.getDirtyData()).toEqual(data);

      // complex array
      const complexArrayIndex = 1;

      const group4 = component.schema[3] as FlexyFormFieldLayoutSchema;
      const array4 = group4.children[0] as FlexyFormFieldLayoutSchema;

      const array4item2 = array4.items[complexArrayIndex] as FlexyFormFieldLayoutSchema;
      const itemFieldset = array4item2.children[0] as FlexyFormFieldLayoutSchema;

      const arrayParam1 = itemFieldset.children[0] as FlexyFormFieldLayoutSchema;
      arrayParam1.formControl.setValue(5);
      arrayParam1.formControl.markAsDirty();
      fixture.detectChanges();
      data.paramMultiComplex = {};
      data.paramMultiComplex['' + complexArrayIndex] = {};
      data.paramMultiComplex['' + complexArrayIndex].arrayParam1 = 5;
      expect(component.getDirtyData()).toEqual(data);

      const arraySubFieldset = itemFieldset.children[4] as FlexyFormFieldLayoutSchema;
      const subItemP1 = arraySubFieldset.children[0] as FlexyFormFieldLayoutSchema;
      subItemP1.formControl.setValue('Kazimierz I');
      subItemP1.formControl.markAsDirty();
      fixture.detectChanges();
      data.paramMultiComplex['' + complexArrayIndex].arrayFieldset = {};
      data.paramMultiComplex['' + complexArrayIndex].arrayFieldset.P1 = 'Kazimierz I';
      expect(component.getDirtyData()).toEqual(data);

      const subItemP2 = arraySubFieldset.children[1] as FlexyFormFieldLayoutSchema;
      subItemP2.formControl.setValue('Kazimierz II');
      subItemP2.formControl.markAsDirty();
      fixture.detectChanges();
      data.paramMultiComplex['' + complexArrayIndex].arrayFieldset.P2 = 'Kazimierz II';
      expect(component.getDirtyData()).toEqual(data);

      // complex array with external
      const arrayExternalParam = itemFieldset.children[5] as FlexyFormFieldLayoutSchema;
      arrayExternalParam.formControl.setValue(55);
      arrayExternalParam.formControl.markAsDirty();
      fixture.detectChanges();
      data['ParamExt' + (complexArrayIndex + 1)] = 55;
      expect(component.getDirtyData()).toEqual(data);
    });
  }));
});

@Component({
  selector: 'flexy-forms-testing',
  template: `
    <flexy-layout [schema]="schema"></flexy-layout>
  `,
  styles: [
    `
      :host ::ng-deep .flx-container {
        background-color: burlywood;
        margin: 2px;
        padding: 10px;
      }
      :host ::ng-deep .flx-row {
        background-color: olive;
        margin: 2px;
        padding: 10px;
      }
      :host ::ng-deep .flx-col {
        background-color: #3dc7ab;
        margin: 2px;
        padding: 10px;
      }
    `
  ]
})
class FormTestingComponent implements OnInit {
  schema: FlexyFormLayoutSchema[];
  form: FormGroup;
  flexyForm: FlexyForm;

  constructor(private formJsonMapperService: FlexyFormJsonMapperService) {}

  ngOnInit() {
    const form = this.formJsonMapperService.createForm(cloneDeep(FORM_SCHEMA), false, cloneDeep(FORM_DATA));
    this.schema = form.schema;
    this.form = form.formGroup;
    this.flexyForm = form;
  }

  getAllData() {
    return this.flexyForm.getAllData();
  }

  getDirtyData() {
    return this.flexyForm.getDirtyData();
  }
}

@Component({
  selector: 'flexy-custom-testing',
  template: `
    <div>{{ p1 }}{{ p2 }}</div>
  `,
  styles: [
    `
      :host {
        background-color: deeppink;
        margin: 2px;
        padding: 20px;
        display: block;
      }
    `
  ]
})
class TestingCustomComponent {
  @Input() layoutSchema: FlexyFormLayoutSchema[];
  @Input() p1: number;
  @Input() p2: string;
}

@NgModule({
  imports: [CommonModule],
  declarations: [TestingCustomComponent],
  exports: [TestingCustomComponent],
  entryComponents: [TestingCustomComponent]
})
export class TestingCustomModule {}

class Page {
  fixture: ComponentFixture<FormTestingComponent>;

  constructor(fixture: ComponentFixture<FormTestingComponent>) {
    this.fixture = fixture;
  }
}