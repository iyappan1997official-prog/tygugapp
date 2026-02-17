import { Injectable } from '@angular/core';

interface Data {
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class DataSharingService {
  private _data: Data = {}; // Private variable to hold data

  // Getter for data
  get data(): object {
    return this._data;
  }

  // Setter for data
  set data(value: object) {
    this._data = value;
  }
}
