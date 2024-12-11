if (typeof document !== 'undefined') {
  const generateNoteId = () => {
    const urlParams = new URLSearchParams(window.location.search);
    let noteId = urlParams.get('note');

    if (!noteId) {
      // Generate a new unique ID if one doesn't exist
      noteId = Math.random().toString(36).substr(2, 9);
      const newUrl = `${window.location.origin}?note=${noteId}`;
      window.history.pushState(null, '', newUrl);
    }

    return noteId;
  };

  const loadNote = (noteId) => {
    const noteContent = localStorage.getItem(noteId);

    if (noteContent) {
      document.getElementById('note-content').value = noteContent;
    }
  };

  document.getElementById('save-note').addEventListener('click', () => {
    const noteContent = document.getElementById('note-content').value;

    if (!noteContent.trim()) {
      alert('Please write something in the note!');
      return;
    }

    const noteId = generateNoteId();
    localStorage.setItem(noteId, noteContent);

    // Generate a shareable link
    const shareLink = `${window.location.origin}?note=${noteId}`;
    document.getElementById('share-link').value = shareLink;

    // Show the share link
    document.getElementById('note-link').classList.remove('hidden');
    alert('Note saved successfully!');
  });

  document.getElementById('delete-note').addEventListener('click', () => {
    const noteId = generateNoteId();
    const noteContent = document.getElementById('note-content').value;

    if (!noteContent.trim()) {
      alert('No note to delete!');
      return;
    }

    // Remove the note from localStorage
    localStorage.removeItem(noteId);
    document.getElementById('note-content').value = '';
    alert('Note deleted successfully!');
  });

  // Load note on page load
  window.onload = () => {
    const noteId = generateNoteId();
    loadNote(noteId);
  };
}

