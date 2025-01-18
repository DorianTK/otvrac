import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Info from "./components/Info/Info";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Profile from "./components/Profile/Profile";

const domain = import.meta.env.VITE_AUTH0_DOMAIN!;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID!;


const router = createBrowserRouter([
    {
        path: "/",
        element: <Info></Info>,
    },
    {
        path: "/userprofile",
        element: <Profile></Profile>
    }
])

createRoot(document.getElementById("root")!).render(
    <Auth0Provider
        domain={domain}
        clientId={clientId}
        authorizationParams={{
            redirect_uri: import.meta.env.VITE_AUTH0_REDIRECT_URI || window.location.origin,
        }}
    >
        <StrictMode>
            <RouterProvider router={router} />
        </StrictMode>
    </Auth0Provider>
);
