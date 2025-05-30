export interface Link {
    id: string;
    originalUrl: string;
    shortUrl: string;
    accessCount: number;
    createdAt: string;
}

export interface LinksPaginatedResponse {
    links: Link[];
}

export interface LinkExportResponse {
    reportUrl: string;
}