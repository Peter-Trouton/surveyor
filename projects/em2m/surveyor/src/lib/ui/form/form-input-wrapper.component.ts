import {
  Component, ComponentFactoryResolver, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef,
  EventEmitter, Output
} from '@angular/core';
import {ControlDefinition} from './form.model';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'surveyor-form-input',
  template: '<div #inputTarget></div>'
})
export class SurveyorFormInputWrapperComponent implements OnInit, OnDestroy {

  @ViewChild('inputTarget', {read: ViewContainerRef}) inputTarget: any;
  @Input() controlDefinition: ControlDefinition;
  @Input() controlInstance: FormControl;
  @Input() asyncValues: any;
  @Input() asyncOptions: any;
  @Input() value: any;
  @Input() readonly = false;
  @Output() onValueChange = new EventEmitter();

  currentComponent: any;
  private asyncValSubscription: any;
  private asyncOptsSubscription: any;

  constructor(private resolver: ComponentFactoryResolver) {}

  ngOnInit() {
    let factory = this.resolver.resolveComponentFactory(this.controlDefinition.component);
    let component = this.inputTarget.createComponent(factory);
    component.instance.controlDefinition = this.controlDefinition;
    component.instance.formControl = this.controlInstance;
    component.instance.readonly = this.readonly;
    this.controlInstance.valueChanges.subscribe(() => {
      this.onValueChange.emit(true);
    })
    this.inputTarget.insert(component.hostView);

    if (this.currentComponent) {
      this.currentComponent.destroy();
    }
    this.currentComponent = component;
    let syncVal = this.controlDefinition.value;
    if (syncVal && this.currentComponent) { this.currentComponent.instance.setValue(syncVal); }

    if (this.asyncValues && this.asyncValues.subscribe) {
      this.asyncValSubscription = this.asyncValues.subscribe((vals: any) => {
        let val = vals[this.controlDefinition.key];
        if (val && this.currentComponent) { this.currentComponent.instance.setValue(val); }
      });
    }

    if (this.asyncOptions && this.asyncOptions.subscribe) {
      this.asyncOptsSubscription = this.asyncOptions.subscribe((data: any) => {
        let opts = data[this.controlDefinition.key];
        if (opts && this.currentComponent) { this.currentComponent.instance.setOptions(opts); }
      });
    }
  }

  ngOnDestroy() {
    if (this.asyncValSubscription) {
      this.asyncValSubscription.unsubscribe();
    }
    if (this.asyncOptsSubscription) {
      this.asyncOptsSubscription.unsubscribe();
    }
  }
}
