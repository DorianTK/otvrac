import { createTheme, responsiveFontSizes } from "@mui/material";

let theme = createTheme({
    typography: {
        fontFamily: "Geist Mono",
    }
})

theme = responsiveFontSizes(theme);
export default theme;