if (typeof document !== 'undefined') {
  // Azure Blob Storage configuration
  const storageAccountUrl = "https://memonote.blob.core.windows.net";
  const containerName = "notes";
  const sasToken = "sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2025-12-12T13:55:38Z&st=2024-12-12T05:55:38Z&spr=https,http&sig=FrTfeNewJuzN1WtVcQ3qKsFA4H%2BgOdplOkVlsqTtEVk%3D";

  // Function to upload a blob
  async function uploadBlob(blobName, content) {
    const url = `${storageAccountUrl}/${containerName}/${blobName}?${sasToken}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "x-ms-blob-type": "BlockBlob",
        "Content-Type": "text/plain",
      },
      body: content,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload blob: ${response.statusText}`);
    }
  }

  // Function to download a blob
  async function downloadBlob(blobName) {
    const url = `${storageAccountUrl}/${containerName}/${blobName}?${sasToken}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download blob: ${response.statusText}`);
    }

    return await response.text();
  }

  // Save note click handler
  document.getElementById('save-note').addEventListener('click', async () => {
    const noteContent = document.getElementById('note-content').value;

    if (!noteContent.trim()) {
      alert('Please write something in the note!');
      return;
    }

    // Generate a unique ID for the note
    const noteId = Math.random().toString(36).substr(2, 9);
    const blobName = `note_${noteId}.txt`;

    try {
      // Upload the note as a blob
      await uploadBlob(blobName, noteContent);

      // Generate a shareable link
      const shareLink = `${window.location.origin}?note=${noteId}`;
      document.getElementById('share-link').value = shareLink;

      // Show the share link
      document.getElementById('note-link').classList.remove('hidden');
    } catch (error) {
      console.error("Error saving note:", error.message);
      alert("Failed to save note!");
    }
  });

  // Load note from URL
  window.onload = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const noteId = urlParams.get('note');

    if (noteId) {
      const blobName = `note_${noteId}.txt`;

      try {
        const noteContent = await downloadBlob(blobName);

        document.getElementById('note-content').value = noteContent;

        // Generate and show the shareable link
        const shareLink = `${window.location.origin}?note=${noteId}`;
        document.getElementById('share-link').value = shareLink;
        document.getElementById('note-link').classList.remove('hidden');
      } catch (error) {
        console.error("Error loading note:", error.message);
        alert("Failed to load the note. It may not exist.");
      }
    }
  };

  // Copy link to clipboard
  document.getElementById('copy-link').addEventListener('click', () => {
    const shareLink = document.getElementById('share-link').value;
    navigator.clipboard
      .writeText(shareLink)
      .then(() => alert('Link copied to clipboard!'))
      .catch((err) => alert('Failed to copy link: ' + err));
  });
}
