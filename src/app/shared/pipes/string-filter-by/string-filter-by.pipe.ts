import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stringFilterBy'
})
export class StringFilterByPipe implements PipeTransform {
  transform(arr: any[], searchText: string, fieldName?: string): any[] {
    if (!arr) return [];

    if (!searchText) return arr;

    searchText = searchText.toLowerCase();

    return arr.filter((iterator: any) => {
      if (typeof iterator === "string") {
        return iterator.toLowerCase().includes(searchText);
      } else if (typeof iterator === "number") {
        return iterator.toString().toLowerCase().includes(searchText);
      } else {
        return iterator[fieldName].toLowerCase().includes(searchText);
      }
    });
  }

}
