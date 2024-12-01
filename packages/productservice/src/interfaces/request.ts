
enum SortOrder {
    ASC,
    DESC
}

interface Pagination {
    limit: number;
    sort: SortOrder;
    nextToken: any;
}

export { SortOrder, Pagination };