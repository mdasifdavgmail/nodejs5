const express = require('express');
const mongoose = require('mongoose');


const app = express();
const port = 2300;

mongoose.connect("mongodb://127.0.0.1:27017/youtube-app-1")
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log("Mongo error", err));

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    jobTitle: {
        type: String
    }
});

const User = mongoose.model('User', userSchema);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/api/users', async (req, res) => {
    try {
        const allDbUsers = await User.find({});
        res.json(allDbUsers);
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/users', async (req, res) => {
    try {
        const allDbUsers = await User.find({});
        const html = `
            <ul>
                ${allDbUsers.map((user) => `<li>${user.firstName} - ${user.email}</li>`).join('')}
            </ul>`;
        res.send(html);
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
});

app.route("/api/users/:id")
    .get(async (req, res) => {
        try {
            const user = await User.findById(req.params.id);
            if (!user) return res.status(404).json({ error: "User not found" });
            res.json(user);
        } catch (err) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    })
    .patch(async (req, res) => {
        try {
            await User.findByIdAndUpdate(req.params.id, { lastName: "changed" });
            res.json({ status: "success" });
        } catch (err) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    })
    .delete(async (req, res) => {
        try {
            await User.findByIdAndDelete(req.params.id);
            res.json({ status: "success" });
        } catch (err) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

app.post("/api/users", async (req, res) => {
    const body = req.body;
    if (!body || !body.first_name || !body.email || !body.job_title||!body.last_name) {
        return res.status(400).json({ error: "Missing required fields: firstName, email, and jobTitle" });
    }

    try {
        const result = await User.create({
            firstName: body.first_name,
            lastName: body.last_name,
            email: body.email,
            jobTitle: body.job_title,
        });
        res.status(201).json({ msg: "success", user: result });
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(port, () => console.log(`Server started on port ${port}`));
