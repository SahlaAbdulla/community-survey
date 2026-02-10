import {useEffect, Suspense} from "react";
import {toggleDocumentAttribute} from "@/utils";
import {useLayoutContext} from "@/context/useLayoutContext.tsx";

const loading = () => <div className=""></div>;

interface DefaultLayoutProps {
    children?: any;
}

const DefaultLayout = (props: DefaultLayoutProps) => {

    const {theme} = useLayoutContext();

    useEffect(() => {
        toggleDocumentAttribute("data-bs-theme", theme)
    }, [theme]);

    useEffect(() => {
        if (document.body)
            document.body.classList.add(
                "authentication-bg",
                "authentication-bg-pattern"
            );

        return () => {
            if (document.body)
                document.body.classList.remove(
                    "authentication-bg",
                    "authentication-bg-pattern"
                );
        };
    }, []);

    // get the child view which we would like to render
    const children = props["children"] || null;

    return (
        <>
            <Suspense fallback={loading()}>{children}</Suspense>
        </>
    );
};
export default DefaultLayout;
