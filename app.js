if (typeof document !== 'undefined') {
  // Azure Blob Storage configuration
  const storageAccountUrl = "https://memonote.blob.core.windows.net";
  const containerName = "notes";
  const sasToken = "sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2025-12-12T13:55:38Z&st=2024-12-12T05:55:38Z&spr=https,http&sig=FrTfeNewJuzN1WtVcQ3qKsFA4H%2BgOdplOkVlsqTtEVk%3D";
// Include Azure Blob Storage SDK via script tag in your HTML: 
// <script src="https://cdn.jsdelivr.net/npm/@azure/storage-blob@12.15.0/dist/azure-storage-blob.min.js"></script>

// Initialize BlobServiceClient
const blobServiceClient = new Azure.StorageBlob.BlobServiceClient(`${storageAccountUrl}?${sasToken}`);

// Example: List blobs in the container
async function listBlobs() {
  const containerName = "notes";
  const containerClient = blobServiceClient.getContainerClient(containerName);

  try {
    console.log("Listing blobs in container:");
    for await (const blob of containerClient.listBlobsFlat()) {
      console.log(`- ${blob.name}`);
    }
  } catch (error) {
    console.error("Error listing blobs:", error.message);
  }
}

// Example: Save a new note
document.getElementById('save-note').addEventListener('click', async () => {
  const noteContent = document.getElementById('note-content').value;

  if (!noteContent.trim()) {
    alert('Please write something in the note!');
    return;
  }

  // Generate a unique ID for the note
  const noteId = Math.random().toString(36).substr(2, 9);
  const containerName = "notes";
  const blobName = `note_${noteId}.txt`;
  const containerClient = blobServiceClient.getContainerClient(containerName);

  try {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.upload(noteContent, noteContent.length);

    // Generate a shareable link
    const shareLink = `${window.location.origin}?note=${noteId}`;
    document.getElementById('share-link').value = shareLink;

    // Show the share link
    document.getElementById('note-link').classList.remove('hidden');
  } catch (error) {
    console.error("Error saving note:", error.message);
  }
});

// Check for note ID in URL on page load
window.onload = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const noteId = urlParams.get('note');

  if (noteId) {
    const containerName = "notes";
    const blobName = `note_${noteId}.txt`;
    const containerClient = blobServiceClient.getContainerClient(containerName);

    try {
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const response = await blockBlobClient.download(0);
      const blobText = await new Response(response.readableStreamBody).text();

      if (blobText) {
        document.getElementById('note-content').value = blobText;
        // Generate and show the shareable link
        const shareLink = `${window.location.origin}?note=${noteId}`;
        document.getElementById('share-link').value = shareLink;
        document.getElementById('note-link').classList.remove('hidden');
      } else {
        alert('Note not found!');
      }
    } catch (error) {
      console.error("Error loading note:", error.message);
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
