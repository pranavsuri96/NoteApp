if (typeof document !== 'undefined') {
  const saveNote = () => {
    const noteContent = document.getElementById('note-content').value;

    if (!noteContent.trim()) {
      alert('Please write something in the note!');
      return;
    }

    // Generate a unique ID for the note
    const noteId = Math.random().toString(36).substr(2, 9);
    localStorage.setItem(noteId, noteContent);

    // Generate a shareable link
    const shareLink = `${window.location.origin}?note=${noteId}`;
    document.getElementById('share-link').value = shareLink;

    // Show the share link
    document.getElementById('note-link').classList.remove('hidden');
  };

  const loadNote = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const noteId = urlParams.get('note');

    if (noteId) {
      const noteContent = localStorage.getItem(noteId);

      if (noteContent) {
        document.getElementById('note-content').value = noteContent;

        // Display the share link
        const shareLink = `${window.location.origin}?note=${noteId}`;
        document.getElementById('share-link').value = shareLink;
        document.getElementById('note-link').classList.remove('hidden');
      } else {
        alert('Note not found!');
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

  document.getElementById('save-note').addEventListener('click', saveNote);
  document.getElementById('copy-link').addEventListener('click', copyLink);

  window.onload = loadNote;
}
