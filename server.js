const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 10000;


// Allow JSON requests
app.use(express.json({
    limit: "256kb"
}));


// Serve index.html
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


    // Create queue item
    const job = {

        id: id,

        username: username,

        script: script,

        createdAt:
            new Date().toISOString()

    };


    // Put script into queue
    queue.push(job);


    console.log(
        `[QUEUE] Added ${id} by ${username}`
    );


    // Tell C# it worked
    res.status(201).json({

        success: true,

        id: id,

        queued: true,

        position: queue.length

    });

});


// ======================================
// GET QUEUE
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


    const job =
        queue.shift();


    console.log(
        `[QUEUE] Removed ${job.id}`
    );


    res.json({

        success: true,

        available: true,

        job: job

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
// START
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
