if (typeof document !== 'undefined') {
  const getNoteIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('note');
  };

  const setNoteIdInUrl = (noteId) => {
    const newUrl = `${window.location.origin}?note=${noteId}`;
    window.history.pushState(null, '', newUrl);
  };

  const saveNote = () => {
    const noteContent = document.getElementById('note-content').value;

    if (!noteContent.trim()) {
      alert('Please write something in the note!');
      return;
    }

    let noteId = getNoteIdFromUrl();
    if (!noteId) {
      // Generate a new unique ID if the link does not exist
      noteId = Math.random().toString(36).substr(2, 9);
      setNoteIdInUrl(noteId);
    }

    // Save or update the note in localStorage
    localStorage.setItem(noteId, noteContent);

    // Update the shareable link
    const shareLink = `${window.location.origin}?note=${noteId}`;
    document.getElementById('share-link').value = shareLink;

    // Show the share link
    document.getElementById('note-link').classList.remove('hidden');
    alert('Note saved successfully!');
  };

  const deleteNote = () => {
    const noteId = getNoteIdFromUrl();

    if (!noteId) {
      alert('No note to delete!');
      return;
    }

    const noteContent = localStorage.getItem(noteId);
    if (!noteContent) {
      alert('No note content found to delete!');
      return;
    }

    // Remove the note from localStorage
    localStorage.removeItem(noteId);
    document.getElementById('note-content').value = '';
    alert('Note deleted successfully!');
  };

  const loadNote = () => {
    const noteId = getNoteIdFromUrl();
    if (noteId) {
      const noteContent = localStorage.getItem(noteId);
      if (noteContent) {
        document.getElementById('note-content').value = noteContent;
        document.getElementById('note-link').classList.remove('hidden');
        document.getElementById('share-link').value = `${window.location.origin}?note=${noteId}`;
      } else {
        alert('Note not found!');
      }
    }
  };

  // Event listeners
  document.getElementById('save-note').addEventListener('click', saveNote);
  document.getElementById('delete-note').addEventListener('click', deleteNote);

  // Load note on page load
  window.onload = loadNote;
}

