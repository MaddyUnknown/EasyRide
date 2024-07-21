import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
const appPath = path.join(__dirname, 'dist');

app.use(express.static(appPath));
app.use((req, res) => {
    res.sendFile(appPath + '/index.html');
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});