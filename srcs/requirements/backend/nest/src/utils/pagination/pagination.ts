import { PaginationResult } from "./pagination.result";

export class Pagination<PaginationDto> {
  public results: PaginationDto[];
  public total: number;

  constructor(paginationResult: PaginationResult<PaginationDto>) {
    this.results = paginationResult.results;
    this.total = paginationResult.total;
  }
}
