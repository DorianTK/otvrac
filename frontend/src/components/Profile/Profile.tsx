import { useAuth0 } from "@auth0/auth0-react";
import { Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";

const Profile = () => {
    const { user } = useAuth0();
    console.log("profile: ", user);
    
    return (
        <Box
            sx={{
                width: 1,
                height: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
            }}
        >
            <Link to="/">Back to home page</Link>
             <Typography variant="h3" fontWeight={500}>
                User Profile
            </Typography>
            <Typography variant="h6">
                Name: {user?.name}
            </Typography>
            <Typography variant="h6">
                Email: {user?.email}
            </Typography>
            <Typography variant="h6">
                Nickname: {user?.nickname}
            </Typography>
            <img src={user?.picture} alt={user?.name} style={{ borderRadius: "50%", marginTop: 8 }} />
        </Box>
    );
};

export default Profile;
