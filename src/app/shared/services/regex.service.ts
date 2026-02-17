import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RegexService {
  email = /^((?:[a-zA-Z0-9]+)|(([a-zA-Z0-9]+(\.|\+|\-|_))+[a-zA-Z0-9]+))@(([a-zA-Z0-9]+(\.|\-))+[a-zA-Z]{2,})$/;

alphabetsOnly = "^[a-zA-Z]*$";

  passwordPattern = new RegExp(
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
  );

  usZipCode = new RegExp(/^[0-9]{5}(?:-[0-9]{4})?$/)

  allPhoneNumber = new RegExp(
    /^(\(?\+?[0-9]*\)?)?[0-9\- \(\)]*$/
  );

  positiveDecimalDigit = /^\.?(?!-)\d+(?:\.\d{1,2})?$/;

  alphaNumerical = new RegExp("^s*([0-9a-zA-Z]*)s*$");

  alphaNumericSpecialChar = new RegExp("^s*([ A-Za-z0-9__-]*)s*$");

  nonZeroPositiveDecimalDigit = new RegExp(
    /^\s*(?=.*[1-9])\d*(?:\.\d{1,4})?\s*$/
  );

  number = new RegExp("^([1-9][0-9]*)$");

  palletQuiltSerial = new RegExp(
/^\s*(([a-zA-Z]{2}\d{6}[aA]\w{4})|([Pp][Ii][Dd][a-zA-Z]\d{5})|([a-zA-Z]{2}\d{6}[aA]\w{4})(\s?,\s?([a-zA-Z]{2}\d{6}[aA]\w{4}|[Pp][Ii][Dd][a-zA-Z]\d{5}))+|([Pp][Ii][Dd][a-zA-Z]\d{5})(\s?,\s?([a-zA-Z]{2}\d{6}[aA]\w{4}|[Pp][Ii][Dd][a-zA-Z]\d{5}))+)\s*$/
  );
}
