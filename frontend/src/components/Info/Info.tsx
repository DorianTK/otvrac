import {
    Box,
    Button,
    Container,
    ThemeProvider,
    Typography,
} from "@mui/material";
import theme from "./../../styles/theme";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import axios from "axios";

const Info = () => {
    const { loginWithRedirect, logout, user, isAuthenticated } = useAuth0();
    console.log(user);
    return (
        <ThemeProvider theme={theme}>
            <Container
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    height: "100vh",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Typography variant="h3" fontWeight={500}>
                    Popis lokalnih dućana - otvoreni podaci
                </Typography>
                <Typography variant="h6" fontWeight={500} sx={{ mb: 4 }}>
                    Ovo je web stranica koja prikazuje popis lokalnih dućana
                    koristeći otvorene podatke
                </Typography>
                <Link
                    variant="h4"
                    href="/popis-lokalnih-ducana.csv"
                    download
                    underline="hover"
                >
                    Download CSV
                </Link>

                <Link
                    variant="h4"
                    href="/popis-lokalnih-ducana.json"
                    download
                    underline="hover"
                >
                    Download JSON
                </Link>
                <Link variant="h4" href="/datatable.html" underline="hover">
                    Go To Data Table View
                </Link>
                {!isAuthenticated && (
                    <Button variant="contained" size="large" onClick={() => loginWithRedirect()}>
                        Login
                    </Button>
                )}
                {isAuthenticated && (
                    <Box
                        sx={{
                            display:"flex",
                            gap: 2,
                            alignItems: "center"
                        }}
                    >
                        <Button
                            variant="contained"
                            onClick={() =>
                                logout({
                                    logoutParams: {
                                        returnTo: window.location.href,
                                    },
                                })
                            }
                        >
                            Logout
                        </Button>
                        <Link to="/userprofile">User Profile</Link>
                        <Button
                            onClick={async () => {
                                try {
                                    const response = await axios.get("http://localhost:4000/api/refresh-data");
                                    const result = await response.data;
                                    console.log("result ", result);
                                    if (result.status === "OK") {
                                        alert("Data refreshed successfully! Files updated.");
                                    } else {
                                        alert("Failed to refresh data.");
                                    }
                                } catch (error) {
                                    console.error("Error refreshing data:", error);
                                    alert("An error occurred while refreshing data.");
                                }
                            }}
                        >Refresh Data Copies</Button>
                    </Box>
                )}
            </Container>
        </ThemeProvider>
    );
};

export default Info;
