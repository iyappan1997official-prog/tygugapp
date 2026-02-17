import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-scanner-modal',
  templateUrl: './scanner-modal.component.html',
  styleUrls: ['./scanner-modal.component.scss']
})
export class ScannerModalComponent implements OnInit {
  public config: Object = {
    isAuto: true
  };
  public output: any[] = [];
  palletSerialNumber: any[] = [];
  valueAdd: boolean = false;
  constructor(
    public modal: NgbActiveModal,
  ) { }

  ngOnInit(): void {
  }

  public onError(e: any): void {
    alert(e);
  }

  public handle(action: any, fn: string): void {
    console.log("hi", this.output);
    if(fn === 'stop'){
      const details = {output: this.output}
      this.modal.close(details);
    }
    action[fn]().subscribe();

    
  }

  addDetails(){
    const details = {output: this.output}
    // console.log("hi", this.output);
    this.modal.close(details);
  }

  start(a:any){
    // this.output = a;
    // this.out.forEach((data: any)=>{
      if(!this.output.includes(a) && a.length > 0){
        this.output.push(a)
      }
    // })
    this.valueAdd = true;
    // this.output.push(a);
    // console.log(this.output)
  }


  removeSerialNumber(array: any[], index: number, indexParentArray?: number) {
    array.splice(index, 1);
    if(array.length === 0){
      this.valueAdd = false;
    }
  }


}
