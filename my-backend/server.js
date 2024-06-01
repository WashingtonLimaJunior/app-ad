const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();
const port = 3000;
const cors = require('cors');

require('dotenv').config();

app.use(cors());

// Configuração do multer para lidar com uploads de arquivos
const upload = multer({ dest: 'uploads/' });

app.post('/describe', upload.single('upload'), async (req, res) => {
  try {
    console.log('Request received');

    if (!req.file) {
      return res.status(400).send('No image provided.');
    }

    const imagePath = req.file.path;
    console.log('Imagem recebida:', imagePath);

    // Faça o processamento necessário com a imagem, por exemplo, enviar para a API do OpenAI

    res.json({ description: 'Descrição da imagem' }); // Retorne a descrição da imagem
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error processing the image');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});