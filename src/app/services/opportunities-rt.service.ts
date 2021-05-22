import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { opportunitiesMock } from "../__mocks__/opportunities.mock";

@Injectable({
  providedIn: 'root'
})
export class OpportunitiesRTService {
  public opportunities = new BehaviorSubject<{ byRole: any[] }>(null);
  constructor() {
  }

  public opportunitiesEmit(date: string) {
    this.opportunities.next(opportunitiesMock);
  }
}
