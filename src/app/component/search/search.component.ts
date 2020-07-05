import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { SearchService } from 'src/app/service/search/search.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';

interface ISearch {
  id: number;
  name: number;
  location: number;
  avatar: number;
  repos: any[];
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})

export class SearchComponent implements OnInit, OnDestroy {
  searchInput: any;
  searchResult: ISearch[];
  cacheResult: any;
  subscriptions = new Subscription();
  searchDataEmitter: Subject<string> = new Subject();
  @ViewChild('mymodal', { static: false }) mymodal: ElementRef;
  constructor(private searchService: SearchService, private modalService: NgbModal, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.searchDataEmitter
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(searchTextValue => {
        // if (!this.searchService.checkIfCacheDataPresent(searchTextValue)) {// will uncomment later
        this.handleSearch(searchTextValue);
        // }
      });
  }

  search() {
    this.spinner.show();
    this.searchDataEmitter.next(this.searchInput);
  }

  handleSearch(val: string | number) {
    this.subscriptions.add(this.searchService.getSearchResult(val)
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(result => {
        this.searchResult = result;
        this.spinner.hide();
      }, (error) => {
        this.searchResult = error.error;
        this.spinner.hide();
      }));
  }

  loadDataFromCache(id: number) {
    this.modalService.open(this.mymodal, { size: 'lg', centered: true });
    this.cacheResult = this.searchService.cacheData.filter((data: any) => data.id === id);
  }

  trackByMethod(index: number, el: any): number {
    return el.id;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
