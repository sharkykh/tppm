#!/usr/bin/env node
const express = require('express');

const app = express();

app.use(express.static('dist'));

const port = 8080;
app.listen(port, () => {
  console.log(`Server running: http://localhost:${port}`);
});
