
interface UserClaims {
    sub: string;                 
    email: string;               
    email_verified: boolean;     
    iss: string;                 
    aud: string;                
    exp: number;                 
    iat: number;                 
    'cognito:username': string;  
    'custom:permissions': string[]; 
    [key: string]: any;         
}


export function checkPermission(user: UserClaims | null, permission: string) : boolean {
    return user?.['custom:permissions']?.includes(permission) || false;
}