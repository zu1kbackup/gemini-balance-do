export function getAuthKey(request: Request): string | undefined {
    // 先查 cookie
    const cookie = request.headers.get('Cookie');
    if (cookie) {
        const match = cookie.match(/auth-key=([^;]+)/);
        if (match) return match[1];
    }
    // 再查 Authorization header
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
        return authHeader.replace(/^Bearer\s+/, '');
    }
    return undefined;
}

export function isAdminAuthenticated(request: Request, authKey: string): boolean {
    if (!authKey) return false;
    const key = getAuthKey(request);
    return key === authKey;
}
