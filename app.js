if (typeof document !== 'undefined') {
  document.getElementById('save-note').addEventListener('click', () => {
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
  });

  // Check if the page has a note ID in the URL
  window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const noteId = urlParams.get('note');

    if (noteId) {
      const noteContent = localStorage.getItem(noteId);

      if (noteContent) {
        document.getElementById('note-content').value = noteContent;

        // Generate and show the shareable link
        const shareLink = `${window.location.origin}?note=${noteId}`;
        document.getElementById('share-link').value = shareLink;
        document.getElementById('note-link').classList.remove('hidden');
      } else {
        alert('Note not found!');
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
