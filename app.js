const { MongoClient } = require('mongodb');

// Replace <password> with your actual password
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

    const shareLink = `${window.location.origin}?note=${noteId}`;
    document.getElementById('share-link').value = shareLink;

    document.getElementById('note-link').classList.add('show');
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

        const shareLink = `${window.location.origin}?note=${noteId}`;
        document.getElementById('share-link').value = shareLink;

        document.getElementById('note-link').classList.add('show');
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

const copyLink = () => {
  const shareLink = document.getElementById('share-link').value;
  navigator.clipboard
    .writeText(shareLink)
    .then(() => alert('Link copied to clipboard!'))
    .catch((err) => alert('Failed to copy link: ' + err));
};

if (typeof document !== 'undefined') {
  document.getElementById('save-note').addEventListener('click', saveNote);
  document.getElementById('copy-link').addEventListener('click', copyLink);

  window.onload = loadNote;
}
