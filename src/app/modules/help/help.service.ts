import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HelpService {
  API_USERS_URL = `${environment.apiUrl}`;
  allUsers: BehaviorSubject<any> = new BehaviorSubject([]);

  constructor(private http: HttpClient) { }

  getFaqs(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/FAQ/GetFAQs`);
  }

  getFaqById(faqId: string | number): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/FAQ/GetFAQById/${faqId}`);
  }

  addUpdateFaq(payload: any): Observable<any> {
    return this.http.post<any>(
      `${this.API_USERS_URL}/FAQ/AddUpdateFAQ`,
      payload
    );
  }

  deleteFaq(faqId: string | number): Observable<any> {
    return this.http.delete<boolean>(
      `${this.API_USERS_URL}/FAQ/DeleteFAQ/${faqId}`,
      {}
    );
  }

  addFeedback(payload: any): Observable<any> {
    return this.http.post<any>(
      `${this.API_USERS_URL}/Feedback/AddFeedback`,
      payload
    );
  }

  getFeedbackList(payload: any): Observable<any> {
    return this.http.post<any>(
      `${this.API_USERS_URL}/Feedback/GetFeedback`,
      payload
    );
  }

  // downloadUserGuide(): Observable<any> {
  //   return this.http.get<any>(`${this.API_USERS_URL}/UserGuide/download`);
  // }

  // uploadUserGuide(file: any): Observable<any> {
  //   return this.http.post<any>(`${this.API_USERS_URL}/UserGuide/upload`, file);
  // }

  // deleteUserGuide(): Observable<any> {
  //   return this.http.post<any>(`${this.API_USERS_URL}/UserGuide/Delete`, {});
  // }

  getSeverityList(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Jira/Severity`);
  }

  getissueTypeList(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Jira/IssueType`);
  }

  getBrowserList(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Jira/Browser`);
  }
  getAppMode(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Jira/AppMode`);
  }
  getMobilePlatform(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/Jira/MobilePlatform`);
  }

  postJira(data: FormData): Observable<any> {
    return this.http.post<any>(`${this.API_USERS_URL}/Jira`, data);
  }

  getAllGuide(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS_URL}/UserGuide/GetUserGuide`);
  }

  uploadJiraFile(issueId: string, file: any): Observable<any> {
    return this.http.post<any>(
      `${this.API_USERS_URL}/Jira/UploadJiraAttachment?issueKey=${issueId}`,
      file
    );
  }

  uploadUserGuide(file: any): Observable<any> {
    return this.http.post<any>(
      `${this.API_USERS_URL}/UserGuide/UploadUserGuide`,
      file
    );
  }

  downloadGuide(docId: any): Observable<any> {
    return this.http.get<any>(
      `${this.API_USERS_URL}/UserGuide/DownloadUserGuide?documentId=${docId}`,
      docId
    );
  }

  removeUserGuide(docId: any): Observable<any> {
    return this.http.post<any>(
      `${this.API_USERS_URL}/UserGuide/RemoveUserGuide?documentId=${docId}`,
      docId
    );
  }
}
