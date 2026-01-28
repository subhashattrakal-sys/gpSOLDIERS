const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

// Serve static files (HTML, JS, CSS, images, videos)
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection (replace with your own connection string)
mongoose.connect('mongodb+srv://yourusername:yourpassword@cluster0.mongodb.net/gpsoldiers?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));

// Draft Schema & Model
const draftSchema = new mongoose.Schema({
    title: String,
    subject: String,
    testNumber: Number,
    questions: [{ imageUrl: String, correctAnswer: String }],
    createdAt: { type: Date, default: Date.now },
    conducted: { type: Boolean, default: false }
});

const Draft = mongoose.model('Draft', draftSchema);

// API Routes

// Save draft
app.post('/api/drafts', async (req, res) => {
    try {
        const draft = new Draft(req.body);
        await draft.save();
        res.status(201).json({ message: 'Draft saved', draft });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all drafts
app.get('/api/drafts', async (req, res) => {
    try {
        const drafts = await Draft.find().sort({ createdAt: -1 });
        res.json(drafts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Conduct exam
app.post('/api/conduct/:id', async (req, res) => {
    try {
        const draft = await Draft.findByIdAndUpdate(req.params.id, { conducted: true }, { new: true });
        if (!draft) return res.status(404).json({ error: 'Draft not found' });
        res.json({ message: 'Exam conducted', draft });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get conducted exams (for student view / fetch page)
app.get('/api/exams', async (req, res) => {
    try {
        const exams = await Draft.find({ conducted: true }).sort({ createdAt: -1 });
        res.json(exams);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Catch-all route → serve index.html for any other path (SPA mode)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
