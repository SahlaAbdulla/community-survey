import { AuthProvider } from '@/context/useAuthContext'
import { LayoutProvider } from '@/context/useLayoutContext'
import { ChildrenType } from "@/types/component-props.ts";
import { CookiesProvider } from 'react-cookie';


const AppProvidersWrapper = ({ children }: ChildrenType) => {
  return (
    <CookiesProvider defaultSetOptions={{ path: '/' }}>
      <AuthProvider>
        <LayoutProvider>
          {children}
        </LayoutProvider>
      </AuthProvider>
    </CookiesProvider>
  )
}
export default AppProvidersWrapper