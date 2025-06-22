import axios from 'axios';
import { Link, LinkExportResponse, LinksPaginatedResponse } from '../domain/link';
import { HttpClient, HttpRequest, HttpResponse } from '../types/http';

export type ILinkService = {
    getPagedLinks(): Promise<LinksPaginatedResponse>;
    getLink(shortUrl: string): Promise<Link>;
    createLink(originalUrl: string, shortUrl: string): Promise<void>;
    deleteLink(shortUrl: string): Promise<void>;
    incrementLinkAccess(shortUrl: string): Promise<void>;
    exportLinkData(): Promise<LinkExportResponse>;
};

class AxiosHttpClient implements HttpClient {
    constructor(private baseUrl: string) { }

    async request<T = any>(data: HttpRequest): Promise<HttpResponse<T>> {
        try {
            const response = await axios.request<T>({
                url: `${this.baseUrl}${data.url}`,
                method: data.method,
                data: data.body,
                headers: data.headers,
                params: data.params,
            });

            return {
                statusCode: response.status,
                data: response.data,
            };
        } catch (error: any) {
            throw error;
        }
    }
}

export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3333';
const httpClient = new AxiosHttpClient(API_BASE_URL);

export class LinkService implements ILinkService {
    constructor(readonly httpClient: HttpClient) { }

    async getPagedLinks(): Promise<LinksPaginatedResponse> {
        const response = await this.httpClient.request<Link[]>({
            url: '/',
            method: 'get',
        });
        return { links: response.data || [] };
    }

    async getLink(shortUrl: string): Promise<Link> {
        const response = await this.httpClient.request<any>({
            url: `/${shortUrl}`,
            method: 'get',
        });
        return {
            id: shortUrl,
            originalUrl: response.data?.message,
            shortUrl: shortUrl,
            accessCount: 0,
            createdAt: new Date().toISOString(),
        };
    }

    async createLink(originalUrl: string, shortUrl: string): Promise<void> {
        await this.httpClient.request<void>({
            url: '/',
            method: 'post',
            body: {
                originalUrl,
                shortUrl,
            },
        });
    }

    async deleteLink(shortUrl: string): Promise<void> {
        await this.httpClient.request<void>({
            url: `/${shortUrl}`,
            method: 'delete',
        });
    }

    async incrementLinkAccess(shortUrl: string): Promise<void> {
        await this.httpClient.request<void>({
            url: `/${shortUrl}/access`,
            method: 'patch',
        });
    }

    async exportLinkData(): Promise<LinkExportResponse> {
        const response = await this.httpClient.request<LinkExportResponse>({
            url: '/links/exports',
            method: 'post',
        });
        return response.data!;
    }
}

export const linkService = new LinkService(httpClient);