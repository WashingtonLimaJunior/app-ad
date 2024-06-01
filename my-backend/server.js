const express = require('express');
const axios = require('axios');
const fs = require('fs');
const multer = require('multer');
const app = express();
const port = 3000;
const cors = require('cors');

require('dotenv').config({ path: './env.env' });

app.use(cors());

// Configuração do multer para lidar com uploads de arquivos
const upload = multer({ dest: 'uploads/' });

// Função para enviar a imagem para a API da OpenAI e obter a descrição
const describeImage = async (imagePath) => {
  const apiKey = process.env.OPENAI_API_KEY;

  try {
    const imageData = fs.readFileSync(imagePath);
    const imageBase64 = imageData.toString('base64');

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };

    const payload = {
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: "Descreva a imagem fornecida." },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
          ]
        }
      ],
      max_tokens: 300
    };

    const response = await axios.post('https://api.openai.com/v1/chat/completions', payload, { headers });
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error describing image:', error.response ? error.response.data : error.message);
    throw error;
  }
};

app.post('/describe', upload.single('upload'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No image provided.');
    }

    const imagePath = req.file.path;

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
