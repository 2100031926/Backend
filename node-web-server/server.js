const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8080;

app.use(bodyParser.json());

const fileDirectory = path.join(__dirname, 'files');

const fileExists = (filename) => fs.existsSync(path.join(fileDirectory, filename));

const getPassword = (req) => req.query.password || req.body.password || '';

app.post('/createFile', (req, res) => {
    const { filename, content, password } = req.body;
    if (!filename || !content) return res.status(400).send('Filename and content are required.');
    if (fileExists(filename)) return res.status(400).send('File already exists.');
    fs.writeFileSync(path.join(fileDirectory, filename), content);
    res.sendStatus(200);
});

app.get('/getFiles', (req, res) => {
    const files = fs.readdirSync(fileDirectory);
    res.json(files);
});

app.get('/getFile', (req, res) => {
    const { filename } = req.query;
    const password = getPassword(req);

    if (!filename) return res.status(400).send('Filename is required.');
    if (!fileExists(filename)) return res.status(400).send('File not found.');

    const fileContent = fs.readFileSync(path.join(fileDirectory, filename), 'utf8');

    if (password && fileContent.password && fileContent.password !== password) {
        return res.status(401).send('Unauthorized: Incorrect password.');
    }

    res.send(fileContent);
});

app.put('/modifyFile', (req, res) => {
    const { filename, content, password } = req.body;
    const currentPassword = getPassword(req);

    if (!filename || !content) return res.status(400).send('Filename and content are required.');
    if (!fileExists(filename)) return res.status(400).send('File not found.');

    const fileContent = fs.readFileSync(path.join(fileDirectory, filename), 'utf8');

    if (fileContent.password && fileContent.password !== currentPassword) {
        return res.status(401).send('Unauthorized: Incorrect password.');
    }

    fs.writeFileSync(path.join(fileDirectory, filename), content);
    res.sendStatus(200);
});

app.delete('/deleteFile', (req, res) => {
    const { filename, password } = req.query;
    const currentPassword = getPassword(req);

    if (!filename) return res.status(400).send('Filename is required.');
    if (!fileExists(filename)) return res.status(400).send('File not found.');

    const fileContent = fs.readFileSync(path.join(fileDirectory, filename), 'utf8');

    if (fileContent.password && fileContent.password !== currentPassword) {
        return res.status(401).send('Unauthorized: Incorrect password.');
    }

    fs.unlinkSync(path.join(fileDirectory, filename));
    res.sendStatus(200);
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
