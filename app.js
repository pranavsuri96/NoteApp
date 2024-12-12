if (typeof document !== 'undefined') {
  // Azure Blob Storage configuration
  const storageAccountUrl = "https://memonote.blob.core.windows.net/";
  const containerName = "notes";
  const sasToken = "sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2025-12-12T13:55:38Z&st=2024-12-12T05:55:38Z&spr=https,http&sig=FrTfeNewJuzN1WtVcQ3qKsFA4H%2BgOdplOkVlsqTtEVk%3D"; // Generate from Azure portal
  
  const blobServiceClient = new AzureStorageBlob.BlobServiceClient(`${storageAccountUrl}?${sasToken}`);
  const containerClient = blobServiceClient.getContainerClient(containerName);

  document.getElementById('save-note').addEventListener('click', async () => {
    const noteContent = document.getElementById('note-content').value;

    if (!noteContent.trim()) {
      alert('Please write something in the note!');
      return;
    }

    const noteId = Math.random().toString(36).substr(2, 9);
    const blockBlobClient = containerClient.getBlockBlobClient(noteId);

    try {
      console.log("Saving note:", noteContent, "with ID:", noteId);
      await blockBlobClient.upload(noteContent, noteContent.length);
      console.log("Note saved successfully!");

      const shareLink = `${window.location.origin}?note=${noteId}`;
      document.getElementById('share-link').value = shareLink;
      document.getElementById('note-link').classList.remove('hidden');
    } catch (error) {
      console.error("Error uploading note:", error);
      alert("Failed to save the note.");
    }
  });

  window.onload = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const noteId = urlParams.get('note');

    if (noteId) {
      const blockBlobClient = containerClient.getBlockBlobClient(noteId);

      try {
        console.log("Fetching note with ID:", noteId);
        const downloadResponse = await blockBlobClient.download(0);
        const noteContent = await new Response(downloadResponse.readableStreamBody).text();
        console.log("Note content retrieved:", noteContent);

        document.getElementById('note-content').value = noteContent;

        const shareLink = `${window.location.origin}?note=${noteId}`;
        document.getElementById('share-link').value = shareLink;
        document.getElementById('note-link').classList.remove('hidden');
      } catch (error) {
        console.error("Error fetching note:", error);
        alert("Note not found!");
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
