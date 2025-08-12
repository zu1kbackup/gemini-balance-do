export function getAuthKey(request: Request, sessionKey?: string): string | undefined {
    if (sessionKey) {
        return sessionKey;
    }
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
        return authHeader.replace(/^Bearer\s+/, '');
    }
    return undefined;
}

// 只支持 Authorization header
export function isAdminAuthenticated(request: Request, authKey: string): boolean {
    if (!authKey) return false;
    const headerKey = request.headers.get('Authorization')?.replace(/^Bearer\s+/, '');
    return headerKey === authKey;
}
