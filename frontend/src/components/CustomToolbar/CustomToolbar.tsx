import { Button } from "@mui/material";
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import {
    gridFilteredSortedRowIdsSelector,
    GridToolbarContainer,
    GridToolbarExport,
    GridToolbarFilterButton,
    GridToolbarQuickFilter,
    useGridApiContext,
} from "@mui/x-data-grid";

const CustomToolbar = () => {
    const apiRef = useGridApiContext();

    const createJSONFile = () => {
        const filteredIds = gridFilteredSortedRowIdsSelector(apiRef);
        const filteredData = filteredIds.map((id) => apiRef.current.getRow(id));

        const jsonString = JSON.stringify(filteredData, null, 4);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "popis-lokalnih-dućana.json";
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <GridToolbarContainer>
            <GridToolbarFilterButton />
            <GridToolbarExport
                printOptions={{ disableToolbarButton: true }}
            ></GridToolbarExport>
            <Button
                children={"Export JSON"}
                onClick={createJSONFile}
                startIcon={<SaveAltIcon></SaveAltIcon>}
                sx={{
                    display: "flex",
                    justifyContent:"center",
                    alignItems: "center",
                    fontSize: "12px",
                    padding: 0,
                    pt: 0.5,
                    pr: 2,
                    pb: 0.5,
                    height: 1
                }}
            >
                
            </Button>
            <GridToolbarQuickFilter />
        </GridToolbarContainer>
    );
};

export default CustomToolbar;
