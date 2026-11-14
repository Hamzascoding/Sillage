import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ApplicationView,
  CompanyDetail,
  CompanySummary,
  Offer,
  OfferFilters,
  PageResult,
  ReviewPayload,
  Statut,
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api';

  offers(filters: OfferFilters = {}): Observable<PageResult<Offer>> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '' && value !== false && value !== 0) {
        params = params.set(key, String(value));
      }
    }
    return this.http.get<PageResult<Offer>>(`${this.base}/offers`, { params });
  }

  offer(id: number): Observable<Offer> {
    return this.http.get<Offer>(`${this.base}/offers/${id}`);
  }

  companies(): Observable<CompanySummary[]> {
    return this.http.get<CompanySummary[]>(`${this.base}/companies`);
  }

  company(id: number): Observable<CompanyDetail> {
    return this.http.get<CompanyDetail>(`${this.base}/companies/${id}`);
  }

  addReview(companyId: number, payload: ReviewPayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.base}/companies/${companyId}/reviews`,
      payload,
    );
  }

  applications(): Observable<ApplicationView[]> {
    return this.http.get<ApplicationView[]>(`${this.base}/applications`);
  }

  apply(offerId: number, statut: 'envoyee' | 'a_postuler'): Observable<ApplicationView> {
    return this.http.post<ApplicationView>(`${this.base}/applications`, { offerId, statut });
  }

  moveApplication(id: number, statut: Statut): Observable<ApplicationView> {
    return this.http.patch<ApplicationView>(`${this.base}/applications/${id}`, { statut });
  }
}
