import {Fragment} from "react";

import "nouislider/dist/nouislider.css";
import "jsvectormap/dist/css/jsvectormap.min.css";
import "react-datepicker/dist/react-datepicker.min.css"

import '@/assets/scss/Default.scss';
import "@/assets/scss/Icons.scss";

import configureFakeBackend from "@/helpers/fake-backend.ts";
import AllRoutes from "@/routes/Routes.tsx";
import AppProvidersWrapper from "@/components/AppProvidersWrapper.tsx";

configureFakeBackend();

function App() {

    return (
        <>
            <Fragment>
                <AppProvidersWrapper>
                    <AllRoutes/>
                </AppProvidersWrapper>
            </Fragment>
        </>
    )
}

export default App
