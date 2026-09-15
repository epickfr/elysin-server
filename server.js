const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 10000;


// ======================================
// JSON
// ======================================

app.use(express.json({
    limit: "50mb"
}));


// ======================================
// INDEX.HTML
// ======================================

app.use(express.static(
    path.join(__dirname, "public")
));


// ======================================
// QUEUE
// ======================================

const queue = [];


// ======================================
// ADD SCRIPT TO QUEUE
// ======================================

app.post("/api/scripts", (req, res) => {

    const {
        id,
        username,
        script
    } = req.body;


    // Validate ID
    if (
        !Number.isInteger(id) ||
        id < 10000000 ||
        id > 99999999
    ) {

        return res.status(400).json({
            success: false,
            error: "ID must be exactly 8 digits"
        });

    }


    // Validate username
    if (
        typeof username !== "string" ||
        username.trim() === ""
    ) {

        return res.status(400).json({
            success: false,
            error: "Username is required"
        });

    }


    // Validate script
    if (
        typeof script !== "string" ||
        script.trim() === ""
    ) {

        return res.status(400).json({
            success: false,
            error: "Script is required"
        });

    }


    // Create job
    const job = {
        id: id,
        username: username,
        script: script,
        createdAt: new Date().toISOString()
    };


    // Add job
    queue.push(job);


    console.log(
        `[QUEUE] Added ${id} by ${username}`
    );


    // Response
    res.status(201).json({

        success: true,

        id: id,

        queued: true,

        position: queue.length

    });

});


// ======================================
// GET ENTIRE QUEUE
// ======================================

app.get("/api/queue", (req, res) => {

    res.json({

        success: true,

        count: queue.length,

        queue: queue

    });

});


// ======================================
// GET NEXT QUEUE ITEM
// ======================================

app.get("/api/queue/next", (req, res) => {

    if (queue.length === 0) {

        return res.json({

            success: true,

            available: false

        });

    }


    const job = queue[0];


    console.log(
        `[QUEUE] Sent job ${job.id}`
    );


    res.json({

        success: true,

        available: true,

        job: job

    });

});


// ======================================
// COMPLETE QUEUE ITEM
// ======================================

app.post("/api/queue/complete", (req, res) => {

    const {
        id
    } = req.body;


    // Validate ID
    if (!Number.isInteger(id)) {

        return res.status(400).json({

            success: false,

            error: "Invalid job ID"

        });

    }


    // Find job
    const index = queue.findIndex(
        job => job.id === id
    );


    // Not found
    if (index === -1) {

        return res.status(404).json({

            success: false,

            error: "Job not found in queue"

        });

    }


    // Remove job
    const removed =
        queue.splice(index, 1)[0];


    console.log(
        `[QUEUE] Completed ${removed.id} by ${removed.username}`
    );


    res.json({

        success: true,

        removed: removed.id,

        remaining: queue.length

    });

});


// ======================================
// CLEAR ENTIRE QUEUE
// ======================================

app.post("/api/queue/clear", (req, res) => {

    const removed =
        queue.length;


    // Remove everything
    queue.splice(0, queue.length);


    console.log(
        `[QUEUE] Cleared ${removed} jobs`
    );


    res.json({

        success: true,

        removed: removed,

        remaining: queue.length

    });

});


// ======================================
// STATUS
// ======================================

app.get("/api/status", (req, res) => {

    res.json({

        online: true,

        queueSize: queue.length

    });

});


// ======================================
// START SERVER
// ======================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Elysian running on port ${PORT}`
        );

    }
);
