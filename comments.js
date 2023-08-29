// Create web server
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

// Create web server
const app = express();
app.use(bodyParser.json());
app.use(cors());

// Create comments object
const commentsByPostId = {};

// Create function to handle event
const handleEvent = (type, data) => {
  if (type === 'CommentCreated') {
    // Get comment data
    const { id, content, postId, status } = data;

    // Find comments array by postId
    const comments = commentsByPostId[postId] || [];

    // Push new comment to comments array
    comments.push({ id, content, status });

    // Set comments array to comments object
    commentsByPostId[postId] = comments;
  }

  if (type === 'CommentUpdated') {
    // Get comment data
    const { id, content, postId, status } = data;

    // Find comments array by postId
    const comments = commentsByPostId[postId];

    // Find comment in comments array
    const comment = comments.find((comment) => {
      return comment.id === id;
    });

    // Update comment
    comment.status = status;
    comment.content = content;
  }
};

// Handle events
app.post('/events', (req, res) => {
  // Get event data
  const { type, data } = req.body;

  // Pass event data to handleEvent function
  handleEvent(type, data);

  // Send response
  res.send({});
});

// Get comments by postId
app.get('/posts/:id/comments', (req, res) => {
  // Get comments array by postId
  const comments = commentsByPostId[req.params.id] || [];

  // Send response
  res.send(comments);
});

// Listen for request
app.listen(4001, async () => {
  console.log('Listening on 4001');

  // Get all events
  const res = await axios.get('http://event-bus-srv:4005/events');

  // Iterate over events
  for (let event of res.data) {
    console.log('Processing event:', event.type);

    // Pass event data to handleEvent function
    handleEvent(event.type, event.data);
  }
});