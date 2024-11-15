const express = require('express');
const axios = require('axios');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 3000;
const cors = require('cors');

require('dotenv').config({ path: './env.env' });

app.use(cors());
app.use(express.static('public'));

// Configuração do multer para lidar com uploads de arquivos
const upload = multer({ dest: 'uploads/' });

// Endpoint para verificar o status do servidor
app.get('/status', (req, res) => {
  res.send('Online');
});

// Função para enviar a imagem para a API da OpenAI e obter a descrição
const describeImage = async (imagePath) => {
  const apiKey = process.env.OPENAI_API_KEY;

  try {
    const imageData = fs.readFileSync(imagePath);
    const imageBase64 = imageData.toString('base64');

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Descreva a imagem para uma pessoa cega usando no máximo 30 palavras' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
          ]
        }
      ],
      max_tokens: 50
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Resposta da API:', JSON.stringify(response.data, null, 2));
    if (response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content;
    } else {
      console.error('No choices found in response:', response.data);
      return 'Descrição não encontrada';
    }
  } catch (error) {
    console.error('Error describing image:', error.response ? error.response.data : error.message);
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

    // Responder com a descrição apenas (sem áudio)
    res.json({ description });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error processing the image');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
