import { Container, Link, ThemeProvider, Typography } from "@mui/material";
import theme from "./../../styles/theme"


const Info = () => {
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
                <Typography variant="h6" fontWeight={500} sx={{ mb: 4}}>
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
                <Link
                    variant="h4"
                    href="/datatable.html"
                    underline="hover"
                >
                    Go To Data Table View
                </Link>
            </Container>
        </ThemeProvider>
    );
};

export default Info;
