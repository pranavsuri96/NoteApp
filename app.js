const { MongoClient } = require('mongodb');

const uri = '<mongodb+srv://pranavsuri96:<password>@memoapp.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000>';  // Replace with your Cosmos DB URI
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const getNoteIdFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('note');
};

const setNoteIdInUrl = (noteId) => {
  const newUrl = `${window.location.origin}?note=${noteId}`;
  window.history.pushState(null, '', newUrl);
};

const saveNote = async () => {
  const noteContent = document.getElementById('note-content').value;

  if (!noteContent.trim()) {
    alert('Please write something in the note!');
    return;
  }

  let noteId = getNoteIdFromUrl();
  if (!noteId) {
    noteId = Math.random().toString(36).substr(2, 9);
    setNoteIdInUrl(noteId);
  }

  try {
    await client.connect();
    const database = client.db('collaborative-notes');
    const notesCollection = database.collection('notes');
    await notesCollection.updateOne(
      { noteId },
      { $set: { content: noteContent } },
      { upsert: true }
    );

    // Update the shareable link
    const shareLink = `${window.location.origin}?note=${noteId}`;
    document.getElementById('share-link').value = shareLink;

    // Show the share link
    document.getElementById('note-link').classList.remove('hidden');
    alert('Note saved successfully!');
  } catch (err) {
    console.error('Error saving note:', err);
    alert('Error saving note.');
  } finally {
    await client.close();
  }
};

const loadNote = async () => {
  const noteId = getNoteIdFromUrl();
  if (noteId) {
    try {
      await client.connect();
      const database = client.db('collaborative-notes');
      const notesCollection = database.collection('notes');
      const note = await notesCollection.findOne({ noteId });
      if (note) {
        document.getElementById('note-content').value = note.content;
        document.getElementById('note-link').classList.remove('hidden');
        document.getElementById('share-link').value = `${window.location.origin}?note=${noteId}`;
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

// Event listeners
document.getElementById('save-note').addEventListener('click', saveNote);

// Load note on page load
window.onload = loadNote;

// Add event listener for "Copy Link" button
document.getElementById('copy-link').addEventListener('click', () => {
  const shareLink = document.getElementById('share-link').value;
  navigator.clipboard.writeText(shareLink)
    .then(() => alert('Link copied to clipboard!'))
    .catch(err => alert('Failed to copy link: ' + err));
});
