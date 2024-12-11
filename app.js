const http = require('http');
const url = require('url');

http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/save-note') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      const noteContent = JSON.parse(body).noteContent;

      if (!noteContent.trim()) {
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({message: 'Please write something in the note!'}));
        return;
      }

      // Generate a unique ID for the note
      const noteId = Math.random().toString(36).substr(2, 9);
      // Store the note in a server-side database or temporary storage (e.g., in-memory object)
      // In this example, we'll just log it
      console.log(`Note ID: ${noteId}, Content: ${noteContent}`);

      // Generate a shareable link
      const shareLink = `http://example.com/note/${noteId}`;
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({shareLink}));

      // In a real scenario, you'd want to return this link to the client
      // and maybe render it in your HTML page.
    });
  } else if (req.method === 'GET' && req.url.startsWith('/note/')) {
    const noteId = req.url.split('/').pop();
    // Retrieve the note from the server-side storage
    // Here we just log it for simplicity
    console.log(`Requested note ID: ${noteId}`);

    // Assuming note content is retrieved, send it as response
    const noteContent = "Note content here"; // Replace with actual content
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({noteContent}));
  } else {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('Not Found');
  }
}).listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
