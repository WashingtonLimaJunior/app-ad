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

// Função para enviar a imagem para a API da OpenAI e obter a descrição
const describeImage = async (imagePath) => {
  const form = new FormData();
  form.append('file', fs.createReadStream(imagePath));
  form.append('purpose', 'fine-tune');

  const apiKey = process.env.OPENAI_API_KEY;
  
  try {
    const response = await axios.post('https://api.openai.com/v1/files', form, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        ...form.getHeaders()
      }
    });

    // Supondo que a resposta da API contenha a descrição da imagem
    return response.data.choices[0].text;
  } catch (error) {
    console.error('Error describing image:', error);
    throw error;
  }
};

app.post('/describe', upload.single('upload'), async (req, res) => {
  try {
    console.log('Request received');

    if (!req.file) {
      return res.status(400).send('No image provided.');
    }

    const imagePath = req.file.path;
    console.log('Imagem recebida:', imagePath);

    // Enviar a imagem para a API do OpenAI e obter a descrição
    const description = await describeImage(imagePath);

    res.json({ description });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error processing the image');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
