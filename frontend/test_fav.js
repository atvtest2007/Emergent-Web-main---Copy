const axios = require('axios');

async function run() {
    const api = axios.create({ baseURL: 'http://localhost:8000/api' });

    // 1. Add
    console.log("Adding...");
    const addRes = await api.post("/user/favorites", {
        content_type: "vod",
        content_id: "659700",
        content_data: { name: "Test" }
    });
    console.log("Add:", addRes.data);

    // 2. Remove
    console.log("Removing...");
    const removeRes = await api.delete("/user/favorites/vod/659700");
    console.log("Remove:", removeRes.data);

    // 3. List
    const listRes = await api.get("/user/favorites");
    console.log("List has 659700?", listRes.data.some(f => f.content_id === "659700"));
}

run().catch(console.error);
