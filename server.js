const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const shortid = require('shortid');
const cors = require('cors');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error(err));

// Note schema and model
const noteSchema = new mongoose.Schema({
    title: String,
    content: String,
    shareableLink: { type: String, default: shortid.generate },
    lastUpdated: { type: Date, default: Date.now },
});

const Note = mongoose.model('Note', noteSchema);

// Routes
// Create a new note
app.post('/api/notes', async (req, res) => {
    const { title, content } = req.body;
    try {
        const note = new Note({ title, content });
        await note.save();
        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ error: 'Error creating note' });
    }
});

// Get a note by shareable link
app.get('/api/notes/:link', async (req, res) => {
    const { link } = req.params;
    try {
        const note = await Note.findOne({ shareableLink: link });
        if (!note) return res.status(404).json({ error: 'Note not found' });
        res.json(note);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching note' });
    }
});

// Update a note by shareable link
app.put('/api/notes/:link', async (req, res) => {
    const { link } = req.params;
    const { title, content } = req.body;
    try {
        const note = await Note.findOneAndUpdate(
            { shareableLink: link },
            { title, content, lastUpdated: Date.now() },
            { new: true }
        );
        if (!note) return res.status(404).json({ error: 'Note not found' });
        res.json(note);
    } catch (error) {
        res.status(500).json({ error: 'Error updating note' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
