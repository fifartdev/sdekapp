import AuthProvider from "../contexts/AuthContext";

export const Providers = ({children}) => {
    return (
    
        <AuthProvider>
            {children}
        </AuthProvider>
    )
    
    }