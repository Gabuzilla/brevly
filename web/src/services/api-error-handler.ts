export function getApiErrorMessage(error: any): string {
    if (error && typeof error === 'object' && 'response' in error && error.response && 'data' in error.response) {
        if (error.response.data && typeof error.response.data.message === 'string') {
            return error.response.data.message;
        }
        if (error.response.data && Array.isArray(error.response.data.issues) && error.response.data.issues.length > 0) {
            return error.response.data.issues[0].message;
        }
    } else if (error instanceof Error) {
        return error.message;
    }
    return 'Ocorreu um erro inesperado.';
}