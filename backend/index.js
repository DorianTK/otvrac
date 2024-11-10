const express = require("express");
const app = express();
const cors = require("cors");

const PORT = 4000;

app.use(cors());

const Pool = require("pg").Pool;
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "popisducana",
    password: "airwaves",
    port: 5432,
});

app.get("/api/stores", async (req, res) => {
    try {
        const query = `
        SELECT json_agg(
            json_build_object(
                'store_id', s.store_id,
                'store_name', s.store_name,
                'address', s.address,
                'latitude', s.latitude,
                'longitude', s.longitude,
                'opening_hours', s.opening_hours,
                'store_type', s.store_type,
                'parking_availability', s.parking_availability,
                        'chain_name', s.chain_name,
                'departments', (
                    SELECT json_agg(
                        json_build_object('department_name', d.department_name)
                    )
                    FROM departments d
                    WHERE d.store_id = s.store_id
                    )
                )
            ) AS stores_json
        FROM stores s;`;

        const data =  await pool.query(query);
        res.json(data.rows[0].stores_json);
    } catch (error) {
        console.log(error);
    }
});

app.listen(PORT, () => {
    console.log(`Running on: localhost:${PORT}`);
});
