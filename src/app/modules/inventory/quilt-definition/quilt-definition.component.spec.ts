import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuiltDefinitionComponent } from './quilt-definition.component';

describe('QuiltDefinitionComponent', () => {
  let component: QuiltDefinitionComponent;
  let fixture: ComponentFixture<QuiltDefinitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuiltDefinitionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuiltDefinitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
