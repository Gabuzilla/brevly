export type HttpResponse<T = any> = {
    statusCode: number;
    data?: T;
};

export type HttpRequest = {
    url: string;
    method: 'get' | 'post' | 'put' | 'delete' | 'patch';
    body?: any;
    headers?: any;
    params?: any;
};

export interface HttpClient {
    request<T = any>(data: HttpRequest): Promise<HttpResponse<T>>;
}