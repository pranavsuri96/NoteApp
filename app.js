const { MongoClient } = require('mongodb');

// Cosmos DB connection URI
const uri = 'mongodb+srv://pranavsuri96:<password>@memoapp.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const getNoteIdFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('note');
};

const setNoteIdInUrl = (noteId) => {
  const newUrl = `${window.location.origin}?note=${noteId}`;
  window.history.pushState(null, '', newUrl);
};

const saveNoteToDb = async (noteId, noteContent) => {
  try {
    await client.connect();
    const database = client.db('collaborative-notes');
    const notesCollection = database.collection('notes');

    await notesCollection.updateOne(
      { noteId },
      { $set: { content: noteContent } },
      { upsert: true }
    );
    return true;
  } catch (err) {
    console.error('Error saving note to DB:', err);
    return false;
  } finally {
    await client.close();
  }
};

const loadNoteFromDb = async (noteId) => {
  try {
    await client.connect();
    const database = client.db('collaborative-notes');
    const notesCollection = database.collection('notes');

    const note = await notesCollection.findOne({ noteId });
    return note ? note.content : null;
  } catch (err) {
    console.error('Error loading note from DB:', err);
    return null;
  } finally {
    await client.close();
  }
};

if (typeof document !== 'undefined') {
  document.getElementById('save-note').addEventListener('click', async () => {
    const noteContent = document.getElementById('note-content').value;

    if (!noteContent.trim()) {
      alert('Please write something in the note!');
      return;
    }

    // Get existing noteId from URL or generate a new one
    let noteId = getNoteIdFromUrl();
    if (!noteId) {
      noteId = Math.random().toString(36).substr(2, 9);
      setNoteIdInUrl(noteId);
    }

    // Save to MongoDB
    const success = await saveNoteToDb(noteId, noteContent);
    if (!success) {
      alert('Error saving note. Please try again.');
      return;
    }

    // Save to localStorage as fallback
    localStorage.setItem(noteId, noteContent);

    // Generate a shareable link
    const shareLink = `${window.location.origin}?note=${noteId}`;
    document.getElementById('share-link').value = shareLink;

    // Show the share link section
    document.getElementById('note-link').classList.remove('hidden');
    alert('Note saved successfully!');
  });

  window.onload = async () => {
    const noteId = getNoteIdFromUrl();

    if (noteId) {
      // Try to load from MongoDB
      const noteContent = await loadNoteFromDb(noteId);

      if (noteContent) {
        document.getElementById('note-content').value = noteContent;
      } else {
        // Fallback to localStorage if not found in DB
        const fallbackContent = localStorage.getItem(noteId);
        if (fallbackContent) {
          document.getElementById('note-content').value = fallbackContent;
        } else {
          alert('Note not found!');
        }
      }
    }
  };

  document.getElementById('copy-link').addEventListener('click', () => {
    const shareLink = document.getElementById('share-link').value;
    navigator.clipboard
      .writeText(shareLink)
      .then(() => alert('Link copied to clipboard!'))
      .catch((err) => alert('Failed to copy link: ' + err));
  });
}
