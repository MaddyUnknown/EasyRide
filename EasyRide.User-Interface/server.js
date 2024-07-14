import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

console.log(__dirname);

app.use(express.static(__dirname));
app.use((req, res) => {
    res.sendFile(__dirname + '/index.html');
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});