import React, { useState } from "react";
import {
    TextField,
    Button,
    Box,
    Checkbox,
    FormControlLabel,
    Typography,
    IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { StoreData } from "../Table/Table";


interface StoreFormProps {
    initialValues: StoreData;
    mode: "add" | "update" | null;
    onSubmit: (mode: "add" | "update" | null, store: StoreData) => void;
}

const StoreForm: React.FC<StoreFormProps> = ({
    initialValues,
    mode,
    onSubmit,
}) => {
    const [store, setStore] = useState<StoreData>(initialValues);

    const handleChange =
        (field: keyof StoreData) =>
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const value =
                field === "parking_availability"
                    ? event.target.checked
                    : event.target.value;
            setStore({ ...store, [field]: value });
        };

    const handleDepartmentChange =
        (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
            const updatedDepartments = [...store.departments];
            updatedDepartments[index].department_name = event.target.value;
            setStore({ ...store, departments: updatedDepartments });
        };

    const addDepartment = () => {
        setStore({
            ...store,
            departments: [...store.departments, { department_name: "" }],
        });
    };

    const removeDepartment = (index: number) => {
        const updatedDepartments = store.departments.filter(
            (_, i) => i !== index
        );
        setStore({ ...store, departments: updatedDepartments });
    };

    const handleSubmit = () => {
        onSubmit(mode, store);
    };

    const textFieldStyles = {
        input: {
            color: "white",
            backgroundColor: "#2e2e2e",
        },
        "& .MuiInputLabel-root": {
            color: "gray",
        },
        "& .MuiOutlinedInput-root": {
            "& fieldset": {
                borderColor: "gray",
            },
            "&:hover fieldset": {
                borderColor: "white",
            },
            "&.Mui-focused fieldset": {
                borderColor: "white",
            },
        },
    };
    

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                width: "50%",
                height: "0px"
            }}
        >
            <Typography variant="h5">
                {mode === "add" ? "Add Store" : "Update Store"}
            </Typography>
            <TextField
                label="Store Name"
                value={store.store_name}
                onChange={handleChange("store_name")}
                required
                sx={textFieldStyles}
            />
            <TextField
                label="Address"
                value={store.address}
                onChange={handleChange("address")}
                required
                sx={textFieldStyles}
            />
            <TextField
                label="Latitude"
                value={store.latitude}
                onChange={handleChange("latitude")}
                type="number"
                required
                sx={textFieldStyles}
            />
            <TextField
                label="Longitude"
                value={store.longitude}
                onChange={handleChange("longitude")}
                type="number"
                required
                sx={textFieldStyles}
            />
            <TextField
                label="Opening Hours"
                value={store.opening_hours}
                onChange={handleChange("opening_hours")}
                required
                sx={textFieldStyles}
            />
            <TextField
                label="Store Type"
                value={store.store_type}
                onChange={handleChange("store_type")}
                required
                sx={textFieldStyles}
            />
            <TextField
                label="Chain Name"
                value={store.chain_name}
                onChange={handleChange("chain_name")}
                required
                sx={textFieldStyles}
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={store.parking_availability}
                        onChange={handleChange("parking_availability")}
                        sx={{
                            color: "white"
                        }}
                    />
                }
                label="Parking Available"
            />
            <Typography variant="h6">Departments</Typography>
            {store.departments.map((department, index) => (
                <Box
                    key={index}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                    <TextField
                        label={`Department ${index + 1}`}
                        value={department.department_name}
                        onChange={handleDepartmentChange(index)}
                        required
                        sx={textFieldStyles}
                    />
                    <IconButton
                        color="error"
                        onClick={() => removeDepartment(index)}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Box>
            ))}
            <Button startIcon={<AddIcon />} onClick={addDepartment}>
                Add Department
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
                {mode === "add" ? "Add Store" : "Update Store"}
            </Button>
        </Box>
    );
};

export default StoreForm;
