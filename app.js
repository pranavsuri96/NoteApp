const { MongoClient } = require('mongodb');

// Cosmos DB connection URI
const uri = 'mongodb+srv://pranavsuri96:<password>@memoapp.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000'; 
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Utility to extract note ID from URL
const getNoteIdFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('note');
};

// Utility to set the note ID in the URL
const setNoteIdInUrl = (noteId) => {
  const newUrl = `${window.location.origin}?note=${noteId}`;
  window.history.pushState(null, '', newUrl);
};

// Save Note functionality
const saveNote = async () => {
  const noteContent = document.getElementById('note-content').value;

  if (!noteContent.trim()) {
    alert('Please write something in the note!');
    return;
  }

  let noteId = getNoteIdFromUrl();
  if (!noteId) {
    noteId = Math.random().toString(36).substr(2, 9); // Generate random note ID
    setNoteIdInUrl(noteId); // Update the URL with the new note ID
  }

  try {
    await client.connect();
    const database = client.db('collaborative-notes');
    const notesCollection = database.collection('notes');

    // Save or update the note in the database
    await notesCollection.updateOne(
      { noteId }, // Filter by noteId
      { $set: { content: noteContent } }, // Update content
      { upsert: true } // Insert if not found
    );

    // Generate and display the shareable link
    const shareLink = `${window.location.origin}?note=${noteId}`;
    document.getElementById('share-link').value = shareLink;

    // Ensure the share link section is visible
    document.getElementById('note-link').classList.remove('hidden');

    alert('Note saved successfully!');
  } catch (err) {
    console.error('Error saving note:', err);
    alert('Error saving note.');
  } finally {
    await client.close();
  }
};

// Load Note functionality
const loadNote = async () => {
  const noteId = getNoteIdFromUrl();
  if (noteId) {
    try {
      await client.connect();
      const database = client.db('collaborative-notes');
      const notesCollection = database.collection('notes');

      // Retrieve the note by noteId
      const note = await notesCollection.findOne({ noteId });

      if (note) {
        document.getElementById('note-content').value = note.content;

        // Generate and display the shareable link
        const shareLink = `${window.location.origin}?note=${noteId}`;
        document.getElementById('share-link').value = shareLink;

        // Ensure the share link section is visible
        document.getElementById('note-link').classList.remove('hidden');
      } else {
        alert('Note not found!');
      }
    } catch (err) {
      console.error('Error loading note:', err);
      alert('Error loading note.');
    } finally {
      await client.close();
    }
  }
};

// Copy Link functionality
const copyLink = () => {
  const shareLink = document.getElementById('share-link').value;
  navigator.clipboard.writeText(shareLink)
    .then(() => alert('Link copied to clipboard!'))
    .catch(err => alert('Failed to copy link: ' + err));
};

// Browser environment setup
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // Event listeners
  document.getElementById('save-note').addEventListener('click', saveNote);
  document.getElementById('copy-link').addEventListener('click', copyLink);

  // Load note on page load
  window.onload = loadNote;
}
