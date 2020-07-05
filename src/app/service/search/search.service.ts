import { Injectable } from '@angular/core';
import { RestService } from 'src/app/shared/services/rest.service';
import { environment } from '../../../environments/environment';
import { ApiPaths } from 'src/app/api-paths.enum';
import { HttpHeaders } from '@angular/common/http';
import { map, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class SearchService {
  baseurl = environment.baseUrl;
  cacheData = [];
  reposUrl: string;
  finalSearchResult: any;
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    })
  };
  constructor(private restService: RestService) { }

  getSearchResult(input: any) {
    const url = `${this.baseurl}/${ApiPaths.Users}/${input}`;
    return this.restService.get(url, {}, {}, this.httpOptions)
      .pipe(
        map(user => {
          this.reposUrl = user.repos_url;
          return user;
        }),
        mergeMap(user => {
          return this.restService.get(this.reposUrl, {}, {}, this.httpOptions)
            .pipe(
              map(repos => {
                this.finalSearchResult = [{
                  id: user.id,
                  name: user.name,
                  location: user.location,
                  avatar: user.avatar_url,
                  login: user.login,
                  repos: this.getMaxStargazerCount(repos)
                }];
                this.cacheData = [...this.cacheData, ...this.finalSearchResult];
                this.cacheData = this.cacheData.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
                return this.cacheData;
              })
            );
        })
      );
  }

  getMaxStargazerCount(data: any) {
    if (data) {
      return data.sort((a: number, b: number) => a[`stargazers_count`] > b[`stargazers_count`] ? -1 : 1).slice(0, 5);
    }
  }

  checkIfCacheDataPresent(input: any): boolean {
    let checkIfDataPresent: boolean;
    if (this.cacheData && this.cacheData.length > 0) {
      const index = this.cacheData.findIndex(x => x.login === input);
      checkIfDataPresent = index > -1 ? true : false;
    }
    return checkIfDataPresent;
  }
}
